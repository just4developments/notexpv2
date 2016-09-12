import {Component, Input, OnInit, Output} from '@angular/core';
import {ViewController, NavParams, NavController} from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';

@Component({
  template: `<ion-header>
    <ion-navbar>
      <ion-title>Select language <small>Registing</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>
    <ion-grid>
      <ion-row>
        <ion-col width-100>
          <ion-list radio-group>
            <ion-list-header>Language</ion-list-header>
            <ion-item>
              <ion-label>English</ion-label>
              <ion-radio value="en" name="language" [checked]="me.lang == 'en'" (click)="change('en')"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>Vietnamese</ion-label>
              <ion-radio value="vi" name="language" [checked]="me.lang == 'vi'" (click)="change('vi')"></ion-radio>
            </ion-item>
          </ion-list>
          <ion-list radio-group>
            <ion-list-header>Choose account</ion-list-header>
            <ion-item>
              <ion-label>Description</ion-label>
              <ion-input [(ngModel)]="me.email" ></ion-input>
            </ion-item>
          </ion-list>
        </ion-col>
      </ion-row>
      <button (click)="done()">Done</button>
    </ion-grid>
  </ion-content>`,
  styles: []
})
export class SetupComponent {
  me: any;

  constructor(private navController: NavController, private navParams: NavParams, private dataProviderService: DataProviderService, private viewController: ViewController) {
    this.me = navParams.get('me');
    this.me.lang = 'vi';
  }

  change(lang: string) {
    this.me.lang = lang;
  }

  done() {
    this.me.lang === 'vi' ? 'VND' : 'USD';
    this.viewController.dismiss(this.me);
  }

}
