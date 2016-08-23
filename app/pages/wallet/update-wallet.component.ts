import {Component} from '@angular/core';
import {NavParams, ViewController, ModalController} from 'ionic-angular';
import {ConvertPipe} from '../../utils.pipe';
import {IconWalletComponent} from './';

@Component({
  template: `<ion-header>
    <ion-navbar>
      <ion-title>FORM <small>WALLET</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>
  <form (ngSubmit)="save()">
    <ion-list>
      <ion-item>
        <ion-avatar item-left (click)="pickAvatar()">
          <div class="ico" [ngStyle]="{'background-position': item.icon}"></div>
        </ion-avatar>
        <ion-label floating>Name</ion-label>
        <ion-input type="text" [(ngModel)]="item.name" name="name" required></ion-input>
      </ion-item>
      <ion-item>
        <ion-label floating>Money: <b [ngClass]="'spending' + (item.money < 0 ? '-1' : '1')">{{item.money | convert:'number':0 | number}}</b></ion-label>
        <ion-input type="number" [(ngModel)]="item.money" name="money" required></ion-input>
      </ion-item>
      <ion-grid no-padding>
        <ion-row>
          <ion-col width-30 no-padding>
            <ion-item>
              <ion-input placeholder="Position" type="number" min="0" max="100" [(ngModel)]="item.oder" name="oder" required></ion-input>
            </ion-item>
          </ion-col>
          <ion-col width-70 no-padding>
            <ion-item>      
              <ion-label>Auto add spending</ion-label>
              <ion-checkbox checked="true" [(ngModel)]="autoAdd" name="autoAdd"></ion-checkbox>
            </ion-item>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-item *ngIf="item.ID">
        <ion-textarea placeholder="Description" type="text" [(ngModel)]="des" name="des"></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-label>Not available in statistic chart</ion-label>
        <ion-checkbox [(ngModel)]="item.avail" name="avail"></ion-checkbox>
      </ion-item>    
    </ion-list>
    <button full padding type="submit">Save</button>
  </form>
  </ion-content>`,
  pipes: [ConvertPipe],
  styles: ['ion-avatar {margin: 20px 8px 0px 0px}']
})
export class UpdateWalletComponent {
  item: any = {};
  des: string;
  autoAdd: boolean = true;

  constructor(navParams: NavParams, private viewController: ViewController, private modalController: ModalController){
    this.item = navParams.data || {};
  }

  pickAvatar(){
    let modal = this.modalController.create(IconWalletComponent);
    modal.onDidDismiss(data => {      
      this.item.icon = data.icon;
      this.item.sicon = data.sicon;
    });
    modal.present();
  }

  save(){
    this.item.oder = +(this.item.oder||0);
    this.item.money = +(this.item.money || 0);
    this.viewController.dismiss(this.item);
  }
}