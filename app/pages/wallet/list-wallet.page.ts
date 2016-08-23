import {Component, Input, OnInit, Output} from '@angular/core';
import {ModalController, AlertController, NavController, Events} from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';
import {UpdateWalletComponent} from './';

@Component({
  template: `<ion-header>
    <ion-navbar>
      <button menuToggle><ion-icon name="menu"></ion-icon></button>
      <ion-title>MANAGEMENT <small>WALLET</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>  
    <ul class="title">
      <li>Swipe left to edit or remove item</li>
    </ul>  
    <ion-list inset *ngIf="wallets1">
      <ion-list-header>
        Available
      </ion-list-header>
      <ion-item-sliding [value]="item.ID" *ngFor="let item of wallets1; let i = index;">
        <ion-item>
          <ion-avatar item-left>
            <div class="ico" [ngStyle]="{'background-position': item.icon}"></div>
          </ion-avatar>
          <h2>{{item.name}}</h2>
        </ion-item>
        <ion-item-options>
          <button primary (click)="edit(item, 1)"><ion-icon name="create"></ion-icon></button>
          <button secondary (click)="remove(item, i, 1)"><ion-icon name="trash"></ion-icon></button>
        </ion-item-options>
      </ion-item-sliding>
    </ion-list>
    <ion-list inset *ngIf="wallets0">
      <ion-list-header>
        Available
      </ion-list-header>
      <ion-item-sliding [value]="item.ID" *ngFor="let item of wallets0; let i = index;">
        <ion-item>
          <ion-avatar item-left>
            <div class="ico" [ngStyle]="{'background-position': item.icon}"></div>
          </ion-avatar>
          <h2>{{item.name}}</h2>
        </ion-item>
        <ion-item-options>
          <button primary (click)="edit(item, 0)"><ion-icon name="create"></ion-icon></button>
          <button secondary (click)="remove(item, i, 0)"><ion-icon name="trash"></ion-icon></button>
        </ion-item-options>
      </ion-item-sliding>
    </ion-list>
    <button fab class="createNew" (click)="gotoCreateNew()"><ion-icon name="add"></ion-icon></button>
  </ion-content>`,
  styles: ['.createNew { position: fixed; bottom: 10px; right: 10px; } ', '.child ion-item {padding-left: 50px;}']
})
export class ListWalletPage {
  wallets1: Array<any> = [];
  wallets0: Array<any> = [];

  constructor(private navController:NavController, private alertController: AlertController, private dataProviderService: DataProviderService, private modalController: ModalController, private events: Events){     
    this.dataProviderService.Wallet.select('WHERE removed = 0 ORDER BY oder ASC').then(resp => {
      this.dataProviderService.each(resp.res.rows, t=>{
        if(t.avail === 1){
          this.wallets1.push(t);
        }else if(t.avail === 0){
          this.wallets0.push(t);
        }else{
          console.error('avail is not 1, 0', t);
        }
      });
    },  error => { console.error(error); });
  }

  gotoCreateNew(){
    let modal = this.modalController.create(UpdateWalletComponent, {
      icon: '-583px -448px',
      sicon: '-388.6666666666667px -298.66666666666663px',
      oder: 0,
      avail: 0
    });
    modal.onDidDismiss(data => {
      this.dataProviderService.Wallet.add(data).then(resp => {
        this.events.publish('sync:to');
        var list = data.avail ? this.wallets1 : this.wallets0;
          for(var i in list){
            if(list[i].oder > data.oder){
              list.splice(parseInt(i), 0, data);          
              break;
            }
          }
        });      
    });
    modal.present();
  }

  edit(item){
    let modal = this.modalController.create(UpdateWalletComponent, item);
    modal.onDidDismiss(data => {
      this.dataProviderService.Wallet.update(data).then(resp => {
        this.events.publish('sync:to');
        item = data;
      });
    });
    modal.present();
  }

  remove(item, i, avail){
    this.alertController.create({
      title: 'Remove this item ?',
      subTitle: `${item.name}`,
      buttons: ['Disagree',
        {
          text: 'Agree',
          handler: () => {
            this.dataProviderService.Wallet.remove(item).then(resp => {
              this.events.publish('sync:to');
              if(avail){
                this.wallets1.splice(i, 1);
              }else{
                this.wallets0.splice(i, 1);
              }
            });            
          }
        }
      ]
    }).present();    
  }
}