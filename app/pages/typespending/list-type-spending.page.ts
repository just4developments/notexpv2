import {Component, Input, OnInit, Output} from '@angular/core';
import {NavController, NavParams, ModalController, AlertController, Events} from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';
import {UpdateTypeSpendingComponent} from './';

@Component({
  template: `<ion-header>
    <ion-navbar>
      <button menuToggle><ion-icon name="menu"></ion-icon></button>
      <ion-title>MANAGEMENT <small>TYPE SPENDING</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>
    <ul class="title">
      <li>Swipe left to edit or remove item</li>
    </ul>
    <ion-list inset>
      <ion-list-header [ngClass]="['spending'+type]">
        {{type > 0 ? 'EARNING TYPE' : 'SPENDING TYPES'}}
        <button primary (click)="add()" item-right rounded><ion-icon name="add"></ion-icon></button>      
      </ion-list-header>
      <ion-item-group *ngFor="let item of typespendings; let index = index;">
        <ion-item-sliding>
          <ion-item>
            <ion-avatar item-left>
              <div class="ico" [ngStyle]="{'background-position': item.icon}"></div>
            </ion-avatar>
            <h2>{{item.name}}</h2>
          </ion-item>
          <ion-item-options>
            <button primary (click)="add(item, index)"><ion-icon name="add"></ion-icon></button>
            <button secondary (click)="edit(item, index)"><ion-icon name="create"></ion-icon></button>
            <button dark (click)="remove(item, index)"><ion-icon name="trash"></ion-icon></button>
          </ion-item-options>
        </ion-item-sliding>
        <ion-item-group *ngIf="item.child" class="child">
          <ion-item-sliding *ngFor="let item0 of item.child; let index0 = index;">
            <ion-item [value]="item.ID">
              <ion-avatar item-left>
                <div class="ico" [ngStyle]="{'background-position': item0.icon}"></div>
              </ion-avatar>
              <h2>{{item0.name}}</h2>
            </ion-item>
            <ion-item-options>
              <button secondary (click)="edit(item0, index0, item)"><ion-icon name="create"></ion-icon></button>
              <button dark (click)="remove(item0, index0, item)"><ion-icon name="trash"></ion-icon></button>
            </ion-item-options>
          </ion-item-sliding>
        </ion-item-group>
      </ion-item-group>
    </ion-list>
  </ion-content>`,
  styles: ['ion-list-header button { padding: 20px 15px; }', '.child ion-item {padding-left: 50px;}']
})
class TypeSpendingTab {
  typespendings:Array<any> = [];
  type: number;

  constructor(private navCtrl: NavController, params: NavParams, private modalController: ModalController, private alertController: AlertController, private dataProviderService: DataProviderService, private events:Events){
    var data = params.get('data');
    this.type = params.get('type');    
    data.forEach((e0:any)=>{
      if(!e0.parent_id) {   
        delete e0.child;
        this.typespendings.push(e0);        
      }else{
        this.typespendings.forEach((e1) => {
          if(e1.ID === e0.parent_id){
            if(!e1.child) e1.child = [];
            e1.child.push(e0);
          }
        });
      }      
    });
  }

  add(parent:any, i: number){    
    let modal = this.modalController.create(UpdateTypeSpendingComponent, {
      icon: '-583px -448px',
      sicon: '-388.6666666666667px -298.66666666666663px',
      oder: 0,
      type: this.type,
      parent_id: parent ? parent.ID : null
    });
    modal.onDidDismiss(data => {
      this.dataProviderService.TypeSpending.add(data).then(resp => {
        this.events.publish('sync:to');
        if(parent) {
          if(!parent.child) parent.child = [];
          parent.child.push(data);
          parent.child.sort((a, b) => {
            return a.oder - b.oder;
          });
        }
        else {
          this.typespendings.push(data);
          this.typespendings.sort((a, b) => {
            return a.oder - b.oder;
          });
        }
      });
    });
    modal.present();
  }

  edit(item:any, i: number, parent: any){
    let modal = this.modalController.create(UpdateTypeSpendingComponent, item);
    modal.onDidDismiss(data => {
      this.dataProviderService.TypeSpending.update(data).then(resp => {
        this.events.publish('sync:to');
        if(parent) {
          parent.child.sort((a, b) => {
            return a.oder - b.oder;
          });
        }
        else {
          this.typespendings.sort((a, b) => {
            return a.oder - b.oder;
          });
        }
      });
    });
    modal.present();
  }

  remove(item:any, i: number, parent: any){
    if(!parent && item.child){
      this.alertController.create({
        title: 'Could not remove this item !',
        subTitle: `Please remove all sub categories before remove this`,
        buttons: ['OK']
      }).present();
    }else{
      this.alertController.create({
        title: 'Remove this item ?',
        subTitle: `${item.name}`,
        buttons: ['Disagree',
          {
            text: 'Agree',
            handler: () => {
              this.dataProviderService.TypeSpending.remove(item).then(resp => {
                this.events.publish('sync:to');
                if(parent){
                  parent.child.splice(i, 1);
                }else{
                  this.typespendings.splice(i, 1);
                }
              });              
            }
          }
        ]
      }).present();
    }
  }
}

@Component({
  template: `<ion-content>    
    <ion-tabs *ngIf="tabEarning && tabSpending">    
      <ion-tab tabIcon="leaf" tabTitle="Spending" [root]="tabSpending" [rootParams]="{view: viewController, data: spending, type: -1}"></ion-tab>
      <ion-tab tabIcon="water" tabTitle="Earning" [root]="tabEarning"  [rootParams]="{view: viewController, data: earning, type: 1}"></ion-tab>
    </ion-tabs>
  </ion-content>`,
  styles: ['.createNew { position: fixed; bottom: 10px; right: 10px; } ', '.child ion-item {padding-left: 50px;}']
})
export class ListTypeSpendingPage {
  tabEarning;
  tabSpending;
  earning: Array<any> = [];
  spending: Array<any> = [];

  constructor(private navCtrl: NavController, navParams: NavParams, private dataProviderService: DataProviderService) {
    this.dataProviderService.TypeSpending.select('WHERE removed = 0 AND (type = -1 OR type = 1) ORDER BY parent_id ASC, oder ASC').then(resp => {
      this.dataProviderService.each(resp.res.rows, t=>{
        if(t.type === 1){
          this.earning.push(t);
        }else if(t.type === -1){
          this.spending.push(t);          
        }
      });
      this.tabEarning = TypeSpendingTab;
      this.tabSpending = TypeSpendingTab;
    });
  }
}