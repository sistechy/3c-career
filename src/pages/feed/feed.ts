import { LoginPage } from "./../login/login";
import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  LoadingController,
  ToastController,
} from "ionic-angular";
import firebase, { firestore } from "firebase";
import moment from "moment";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "page-feed",
  templateUrl: "feed.html",
})
export class FeedPage {
  text: string;
  userRole:string;
  pageSize: number = 10;
  posts: any[] = [];
  cursor: any;
  infiniteEvent: any;
  image: string;
  enableRecruiter:boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public camera: Camera,
    public http: HttpClient
  ) {
    this.getPosts();
  }

  ngOnInit(){
  console.log('ngOninit')
   var dbRef= firebase.firestore().collection("userInfo").doc(firebase.auth().currentUser.uid)
   dbRef.get().then((doc)=>{
     var userDetails = doc.data()
     
     this.userRole=userDetails.role
console.log(this.userRole)
     if(this.userRole == 'recruiter'){
      this.enableRecruiter = true
     }else{
       this.enableRecruiter = false
     }

   },(err)=>{
   console.log(err)
   })

   
  }

  post() {
    firebase
      .firestore()
      .collection("posts")
      .add({
        text: this.text,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        owner: firebase.auth().currentUser.uid,
        owner_name: firebase.auth().currentUser.displayName,
      })
      .then(async (doc) => {
        if (this.image) {
          await this.upload(doc.id);
        }
        this.text = "";
        this.image = undefined;
        let toast = this.toastCtrl
          .create({
            message: "Your post is created successfully",
            duration: 3000,
          })
          .present();
        this.getPosts();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getPosts() {
    this.posts = [];
    let loading = this.loadingCtrl.create({
      content: "Loading Feed",
    });
    loading.present();
    let query = firebase
      .firestore()
      .collection("posts")
      .orderBy("created", "desc")
      .limit(this.pageSize);
    query.onSnapshot((snapshot) => {
      let changedDocs = snapshot.docChanges();
      changedDocs.forEach((change) => {
        if (change.type == "added") {
          //TODO
        }
        if (change.type == "modified") {
          for (let i = 0; i < this.posts.length; i++) {
            if (this.posts[i].id == change.doc.id) {
              this.posts[i] = change.doc;
            }
          }
        }
        if (change.type == "removed") {
          //TODO
        }
      });
    });

    query
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          this.posts.push(doc);
        });
        loading.dismiss();
        console.log(docs);
        this.cursor = this.posts[this.posts.length - 1];
      })
      .catch((err) => {
        console.log(err);
        loading.dismiss();
      });
  }

  ago(time) {
    let difference = moment(time).diff(moment());
    return moment.duration(difference).humanize();
  }

  loadMorePosts(event) {
    firebase
      .firestore()
      .collection("posts")
      .orderBy("created", "desc")
      .startAfter(this.cursor)
      .limit(this.pageSize)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          this.posts.push(doc);
        });
        console.log(docs);
        if (docs.size < this.pageSize) {
          event.enable(false);
          this.infiniteEvent = event;
        } else {
          event.complete();
          this.cursor = this.posts[this.posts.length - 1];
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  refresh(event) {
    this.posts = [];
    this.getPosts();
    event.complete();
    if (this.infiniteEvent) {
      this.infiniteEvent.enable(true);
    }
  }
  logout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        let toastCtrl = this.toastCtrl.create({
          message: "You have been logged out successfully",
          duration: 3000,
        });
        toastCtrl.present();
        this.navCtrl.setRoot(LoginPage);
      });
  }

  addPhoto() {
    this.launchCamera();
  }

  launchCamera() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetHeight: 512,
      targetWidth: 512,
      allowEdit: true,
    };

    this.camera.getPicture(options).then(
      (base64) => {
        this.image = "data:image/png;base64," + base64;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  upload(name: string) {
    return new Promise((resolve, reject) => {
      let loading = this.loadingCtrl.create({
        content: "uploading Images.....",
      });
      loading.present();

      let ref = firebase.storage().ref("postImages/" + name);

      let uploadTask = ref.putString(this.image.split(",")[1], "base64");

      uploadTask.on(
        "state_changed",
        (taskSnapshot: any) => {
          console.log(taskSnapshot);
          let percentage =
            (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100;
          loading.setContent("uploaded" + percentage + "%...");
        },
        (error) => {
          console.log(error);
        },
        () => {
          console.log("The upload is complete!");

          uploadTask.snapshot.ref
            .getDownloadURL()
            .then((url) => {
              firebase
                .firestore()
                .collection("posts")
                .doc(name)
                .update({
                  image: url,
                })
                .then(() => {
                  loading.dismiss();
                  resolve();
                })
                .catch(() => {
                  loading.dismiss();
                  reject();
                });
            })
            .catch((err) => {
              reject();
            });
        }
      );
    });
  }

  like(post) {
    console.log(post);

    let body = {
      postId: post.id,
      userId: firebase.auth().currentUser.uid,
      action:
        post.data().likes &&
        post.data().likes[firebase.auth().currentUser.uid] == true
          ? "unlike"
          : "like",
    };

    let toast = this.toastCtrl.create({
      message: "Updating like.... please wait....",
    });
    toast.present();

    this.http
      .post(
        "https://us-central1-c-career.cloudfunctions.net/updateLikesCount",
        JSON.stringify(body),
        {
          responseType: "text",
        }
      )
      .subscribe(
        (data) => {
          console.log(data);
          toast.setMessage("like updated");
          setTimeout(() => {
            toast.dismiss();
          }, 3000);
        },
        (err) => {
          console.log(err);
          toast.setMessage("like updated");
          setTimeout(() => {
            toast.dismiss();
          }, 3000);
        }
      );
  }


}
