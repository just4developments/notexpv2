import {Component, Input, OnInit, Output} from '@angular/core';
import {NavController, NavParams, Platform, ViewController} from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';

@Component({
  template: `<ion-header>
    <ion-navbar>
      <ion-title>PICK <small>TYPE SPENDING</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>
    <ion-list inset>
      <ion-list-header [ngClass]="['spending'+type]">
        {{type > 0 ? 'EARNING TYPE' : 'SPENDING TYPES'}}
      </ion-list-header>
      <ion-item-group *ngFor="let item of typespendings">
        <ion-item (click)="pick(item)">
          <ion-avatar item-left>
            <div class="ico" [ngStyle]="{'background-position': item.icon}"></div>
          </ion-avatar>
          <h2>{{item.name}}</h2>
        </ion-item>
        <ion-item-group *ngIf="item.child" class="child">
          <ion-item [value]="item.ID" *ngFor="let item0 of item.child" (click)="pick(item0)">
            <ion-avatar item-left>
              <div class="ico" [ngStyle]="{'background-position': item0.icon}"></div>
            </ion-avatar>
            <h2>{{item0.name}}</h2>
          </ion-item>
        </ion-item-group>
      </ion-item-group>
    </ion-list>
  </ion-content>`,
  styles: ['.child ion-item {padding-left: 50px;}']
})
class TypeSpendingTab {
  typespendings:Array<any> = [];
  viewController:ViewController;
  type: number;

  constructor(private navCtrl: NavController, params: NavParams, platform: Platform){ 
    this.viewController= params.get('view');
    this.type = params.get('type');
    var data = params.get('data');
    for(var i in data){
      var e0 = data[i];
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
    }
  }

  pick(item:any){    
    this.viewController.dismiss(item);
  }
}

@Component({
  template: `<ion-tabs *ngIf="tabEarning && tabSpending">    
    <ion-tab tabIcon="leaf"  tabTitle="Spending" [root]="tabSpending" [rootParams]="{view: viewController, data: spending, type: -1}"></ion-tab>
    <ion-tab tabIcon="water" tabTitle="Earning" [root]="tabEarning"  [rootParams]="{view: viewController, data: earning, type: 1}"></ion-tab>
  </ion-tabs>`
})
export class TypeSpendingSelectComponent {
	tabEarning;
  tabSpending;
  earning: Array<any> = [];
  spending: Array<any> = [];

  constructor(private navCtrl: NavController, navParams: NavParams, private viewController: ViewController) {
    this.earning = navParams.get('earning');
    this.spending = navParams.get('spending');
    this.tabEarning = TypeSpendingTab;
    this.tabSpending = TypeSpendingTab;
  }
  
}
