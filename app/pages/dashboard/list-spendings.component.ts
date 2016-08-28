import {Component, Input, Output, EventEmitter} from '@angular/core';
import {DecimalPipe, DatePipe} from '@angular/common';
import {NavController, AlertController, ModalController, Events} from 'ionic-angular';
import {SpendingPage} from '../spending';
import {DataProviderService} from '../../data-provider.service';
import {ConvertPipe} from '../../utils.pipe';
import {Utils} from '../../utils.service';

@Component({
	selector: 'list-spendings',
  template: `<ion-card *ngFor="let day of spendings; let iday = index;" style="margin-bottom: 20px;">
	  <ion-list>
		  <ion-item-divider light>
		  	<ion-avatar item-left>
		    	<div class="day day0">{{day.day}}</div>
		    </ion-avatar>
		  	<h2><b>{{day.date | date: 'EEEE'}}</b></h2>
		    <p>{{day.date | date: 'MMM yyyy'}}</p>
		    <ion-note item-right="" align="right">
		    	<div class="spending1" *ngIf="day.eaning"><b>{{day.earning | convert:'number' | number}}</b></div>
		    	<div class="spending-1" *ngIf="day.spending"><b>{{day.spending | number}}</b></div>
		    </ion-note>
		  </ion-item-divider>
		  <ion-item-sliding *ngFor="let item of day.data; let idata = index;">
		    <ion-item>
			    <ion-avatar item-left>
			    	<div class="ico" [ngStyle]="{'background-position': item.typeSpending.icon}"></div>
			    </ion-avatar>
			    <h2>{{item.typeSpending.name}}</h2>
			    <p>{{item.des}}</p>
			    <ion-note item-right="" [ngClass]="'spending' + item.type">
			    	{{item.type > 0 ? '+' : (item.type < 0 ? '-' : '')}} {{item.money | convert:'number' | number}}
			    </ion-note>
			  </ion-item>
		    <ion-item-options>
		      <button primary (click)="edit(item)"><ion-icon name="create"></ion-icon></button>
		      <button secondary (click)="remove(item, iday, idata)"><ion-icon name="trash"></ion-icon></button>
		    </ion-item-options>
  		</ion-item-sliding>
		</ion-list>
	</ion-card>`,
	pipes: [ConvertPipe],
	styles: ['ion-item-divider ion-note {font-size: 1.1em;}']
})
export class ListSpendingComponent {
	@Input('data') spendings: Array<any>;
	@Input('typespending') typespendings: Array<any>;
	@Input('wallets') wallets: Array<any>;
	@Output('onChange') change:EventEmitter<any> = new EventEmitter();

  constructor(private navCtrl: NavController, private modalController: ModalController, private alertController: AlertController, private dataProviderService:DataProviderService, private events: Events) {

  }

  remove(item: any, iday: number, idata: number){
  	this.alertController.create({
      title: 'Remove this item ?',
      subTitle: `${new DatePipe().transform(item.created_date,'dd MMM,yyyy')} <span class="spending${item.type}">${item.type > 0 ? '+' : item.type < 0 ? '-': ''} ${new DecimalPipe().transform(item.money)}</span><hr/><div align="left"><b>${item.typeSpending.name}</b>: ${item.des}</div>`,
      buttons: ['Disagree',
        {
          text: 'Agree',
          handler: () => {
          	this.dataProviderService.Spending.remove(item).then(resp => {
          		this.events.publish('sync:to');
          		this.spendings[iday].data.splice(idata, 1);
							if(this.spendings[iday].data.length === 0){
								this.spendings.splice(iday, 1);
							}
          	});
          }
        }
      ]
    }).present();
  }

  edit(item: any){
  	let modal = this.modalController.create(SpendingPage, {item});
    modal.onDidDismiss(data => {

    });
    modal.present();
  }

}
