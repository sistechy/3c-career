import { Component } from '@angular/core';
import { NavController, NavParams,ToastController,AlertController } from 'ionic-angular';
import firebase from 'firebase'
import { FeedPage } from '../feed/feed';
@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html',
})
export class SignUpPage {
  name: string;
  email: string;
  password: string
  selectedRole:string
  constructor(public navCtrl: NavController, public navParams: NavParams,public alertCtrl:AlertController,public toastCtrl:ToastController) {
  }

  ionViewDidLoad() {
  //  console.log('ionViewDidLoad SignUpPage');
  }
  fetchRole()
{
 
  console.log(this.selectedRole)
}  goBack() {
    this.navCtrl.pop();
  }

  onSignUp() {
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then((userData) => {
     // console.log(userData)
      firebase.firestore().collection("userInfo").doc(userData.user.uid).set({
        userName:this.name,
        email:this.email,
        role:this.selectedRole
      }).then((res)=>{

      })
      let newUser: firebase.User = userData.user;
      newUser.updateProfile({
        displayName: this.name,
        photoURL: ""

      }).then(() => {
        console.log('profile updated')
        this.alertCtrl.create({
          title:"Account created",
          message:"Your Account has been created successfully",
          buttons:[{
            text:"Ok",
            handler:()=>{
              this.navCtrl.setRoot(FeedPage);
            }
          }]
        }).present();
      }).catch((err) => {
        console.log(err)
      })


    }).catch((err) => {
      this.toastCtrl.create({
        message:err.message,
        duration:3000
      }).present();
    })
  }

}
