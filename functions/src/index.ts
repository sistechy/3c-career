import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

export const updateLikesCount=functions.https.onRequest((request,response)=>{
    console.log(request.body)

    const postId:any=JSON.parse(request.body).postId;
    const action:any=JSON.parse(request.body).action;
    const userId:any=JSON.parse(request.body).userId;


console.log(postId);
console.log(action);
console.log(userId);

    admin.firestore().collection("posts").doc(postId).get().then((data:any)=>{
        let likesCount:any=data.data().likesCount||0;
        let likes:any=data.data().likes||[];
        let updateData:any={}

        if(action=='like'){
            updateData["likesCount"]=++likesCount;
            updateData[`likes.${userId}`]=true;
        }
        else{
            updateData["likesCount"]=--likesCount;
            updateData[`likes.${userId}`]=false;
        }

        admin.firestore().collection("posts").doc(postId).update(updateData).then(()=>{
            response.send(200).send("Done");
        }).catch((err)=>{
            response.send(err.code).send(err.message)
        })

    }).catch((err)=>{
            response.send(err.code).send(err.message)
        })

})
