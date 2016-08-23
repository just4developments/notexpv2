import {Component} from '@angular/core';
import {NavParams, ViewController, ModalController} from 'ionic-angular';
import {ConvertPipe} from '../../utils.pipe';
import {IconWalletComponent} from '../wallet';

@Component({
  template: `<ion-header>
    <ion-navbar>
      <ion-title>FORM <small>TYPE SPENDING</small></ion-title>
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
      <ion-grid no-padding>
        <ion-row>
          <ion-col width-30 no-padding>
            <ion-item>
              <ion-input placeholder="Position" type="number" min="0" max="100" [(ngModel)]="item.oder" name="oder" required></ion-input>
            </ion-item>
          </ion-col>
          <ion-col width-70 no-padding>
            <ion-item>      
              <ion-label>Type</ion-label>
              <ion-label [ngClass]="['spending'+item.type]">{{item.type > 0 ? 'Earning' : 'Spending'}}</ion-label>
            </ion-item>
          </ion-col>
        </ion-row>
      </ion-grid>    
    </ion-list>
    <button full type="submit">Save</button>
  </form>  
  </ion-content>`,
  pipes: [ConvertPipe],
  styles: ['ion-avatar {margin: 20px 8px 0px 0px}']
})
export class UpdateTypeSpendingComponent {
  item: any = {};
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
    this.item.oder = +this.item.oder;
    this.viewController.dismiss(this.item);
  }
}