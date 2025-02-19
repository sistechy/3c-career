import { Component } from "@angular/core";
import { NavController, ToastController } from "ionic-angular";
import { SignUpPage } from "../sign-up/sign-up";
import firebase from "firebase";
import { FeedPage } from "../feed/feed";
@Component({
  selector: "page-login",
  templateUrl: "login.html",
})
export class LoginPage {
  email: string;
  password: string;
  constructor(
    public navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}
  goToSignUp() {
    this.navCtrl.push(SignUpPage);
  }
  login() {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.email, this.password)
      .then((user) => {
        console.log(user);
        this.toastCtrl
          .create({
            message: "Welcome " + user.user.displayName,
            duration: 3000,
          })
          .present();
        this.navCtrl.setRoot(FeedPage);
      })
      .catch((err) => {
        console.log(err);
        this.toastCtrl
          .create({
            message: err.message,
            duration: 3000,
          })
          .present();
      });
  }
}
