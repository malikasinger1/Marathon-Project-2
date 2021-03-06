import { Component, OnInit } from '@angular/core';
import { FireService } from '../../providers/fire.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-inbox',
    templateUrl: './inbox.component.html',
    styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {

    constructor(
        private fs: FireService,
        private router: Router,
        private ActivatedRoute: ActivatedRoute,
    ) { }
    ngOnInit() {

        this.fs.getUser()
            .subscribe(auth => {
                this.myUid = auth.uid
                this.newMessage.from = auth.uid
                this.fs.getData("users/" + auth.uid).subscribe(user => {
                    this.myObject = user
                    console.log("my data: ", user)
                });

                this.ActivatedRoute.params
                    .subscribe((params: any) => {
                        console.log("Router params: ", params);
                        this.recipientUid = params.uid;
                        this.newMessage.to = this.recipientUid;
                        this.fs.getData("users/" + this.recipientUid).subscribe(user => {
                            this.resObject = user;
                            console.log("res data: ", user)
                        });

                        console.log("getting inbox intem from: inbox/" + this.myUid + "/" + this.recipientUid);

                        this.messages = this.fs.getList("inbox/" + this.myUid + "/" + this.recipientUid);
                        this.messages.subscribe(console.log)
                    });
            });
    }
    myUid;
    recipientUid;
    myObject;
    resObject;
    messages;
    input;

    newMessage = {
        text: "",
        from: "",
        to: "",
        timeStamp: this.fs.getDate(),
        image: ""
    }


    sendMessage() {
        this.newMessage.text = this.input || null;

        this.fs.pushData("inbox/" + this.recipientUid + "/" + this.myUid, this.newMessage)
        this.fs.pushData("inbox/" + this.myUid + "/" + this.recipientUid, this.newMessage)

        this.input = "";
    }


    uploadImageToFirebase(event) {
        let filename = event.target.files[0];
        this.fs.uploadImage(filename)
            .then(url => {
                console.log("image url after = " + url);

                this.newMessage.image = url.toString();

                this.fs.pushData("inbox/" + this.recipientUid + "/" + this.myUid, this.newMessage)
                this.fs.pushData("inbox/" + this.myUid + "/" + this.recipientUid, this.newMessage)

                this.newMessage.image = "";
            });;

    };
}