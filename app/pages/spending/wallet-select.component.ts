import {Component, Input, OnInit, Output} from '@angular/core';
import {NavController, NavParams, Platform, ViewController} from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';

@Component({
  template: `<ion-header>
    <ion-navbar>
      <ion-title>PICK <small>WALLET</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>    
    <ion-list inset *ngIf="wallets1">
      <ion-list-header>
        Available
      </ion-list-header>
      <ion-item [value]="item.ID" (click)="pick(item)" *ngFor="let item of wallets1">
        <ion-avatar item-left>
          <div class="ico" [ngStyle]="{'background-position': item.icon}"></div>
        </ion-avatar>
        <h2>{{item.name}}</h2>
      </ion-item>
    </ion-list>
    <ion-list inset *ngIf="wallets0">
      <ion-list-header>
        Not Available
      </ion-list-header>
        <ion-item [value]="item.ID" (click)="pick(item)" *ngFor="let item of wallets0">
          <ion-avatar item-left>
            <div class="ico" [ngStyle]="{'background-position': item.icon}"></div>
          </ion-avatar>
          <h2>{{item.name}}</h2>
        </ion-item>
    </ion-list>
  </ion-content>`
})
export class WalletSelectComponent implements OnInit {
	wallets0: Array<any> = [];
  wallets1: Array<any> = [];

  constructor(private navCtrl: NavController, private navParams: NavParams, private viewController: ViewController) {
    var data = navParams.get('data');    
    for(var t of data) {
      if(t.avail === 1){
        this.wallets1.push(t);
      }else if(t.avail === 0){
        this.wallets0.push(t);
      }else{
        console.error('avail is not 1, 0', t);
      }
    }
  }

  ngOnInit(){
    
  }

  pick(item: any){
    this.viewController.dismiss(item);
  }

}
