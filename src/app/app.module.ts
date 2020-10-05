import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignUpPage } from '../pages/sign-up/sign-up';
import firebase from 'firebase';
import { FeedPage } from '../pages/feed/feed';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {HttpClientModule} from '@angular/common/http';
var firebaseConfig = {
  apiKey: "AIzaSyCmDl9xScHEMoYfIHVxK2U0utU8iBcWSjY",
  authDomain: "c-career.firebaseapp.com",
  databaseURL: "https://c-career.firebaseio.com",
  projectId: "c-career",
  storageBucket: "c-career.appspot.com",
  messagingSenderId: "792219780953",
  appId: "1:792219780953:web:f5c37c555671a7b5d6ae48",
  measurementId: "G-QEPZ2VEZ5T"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignUpPage,
    FeedPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SignUpPage,
    LoginPage,
    FeedPage
  ],
  providers: [
    StatusBar,
    Camera,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
