import {Component, Input, OnInit, Output} from '@angular/core';
import {ViewController, NavParams, NavController} from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';

@Component({
    template: `<ion-header>
    <ion-navbar>
      <button menuToggle><ion-icon name="menu"></ion-icon></button>
      <ion-title>Who can used <small>Sharing</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>
    <ion-grid>
      <ion-row>
        <ion-col width-100>
          <form (submit)="share(email)">
            <ion-list radio-group>
              <ion-list-header>Share using with</ion-list-header>
              <ion-item>
                  <ion-input type="email" placeholder="Email" [(ngModel)]="email" required [ngModelOptions]="{standalone: true}"></ion-input>
                  <button clear item-right type="submit">Share</button>
              </ion-item>
            </ion-list>
          </form>
          <hr/>
          <ion-list radio-group>
            <ion-list-header>Shared with</ion-list-header>
            <ion-item *ngFor="let e of shares">
              <ion-label>{{e}}</ion-label>
              <button clear item-right (click)="noshare(e)">No share</button>
            </ion-item>
          </ion-list>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>`,
    styles: []
})
export class SharePage {
    email: string;
    shares: Array<string> = [];

    constructor(private navController: NavController, private navParams: NavParams, private dataProviderService: DataProviderService, private viewController: ViewController) {
        this.shares = DataProviderService.me.shares || [];
    }

    share(email: string) {
        if(this.shares.indexOf(email) != -1){
          this.email = "";
          return ;
        }
        this.dataProviderService.share(email, shares => {
            this.shares = shares;
            this.email = "";
        });
    }

    noshare(email: string) {
        this.dataProviderService.noshare(email, shares => {
            this.shares = shares;
        });
    }

}
