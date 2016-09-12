import {Component} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NavController, Select, ModalController, AlertController, NavParams, ViewController, Events } from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';
import {TypeSpendingSelectComponent} from './type-spending-select.component';
import {WalletSelectComponent} from './wallet-select.component';
import {Utils} from '../../utils.service';
import {ConvertPipe} from '../../utils.pipe';

@Component({
  template: `<ion-header>
	  <ion-navbar>
	  	<button menuToggle><ion-icon name="menu"></ion-icon></button>
	    <ion-title>SPENDING TODAY ?</ion-title>
	  </ion-navbar>
	</ion-header>
	<ion-content>
		<form (ngSubmit)="save()">
			<ion-list>			
			  <ion-item>
			  	<ion-label floating *ngIf="item.typeSpending">Money: <b [ngClass]="'spending'+item.typeSpending.type">{{item.typeSpending.type < 0 ? '-' : '+'}} {{item.money | convert:'number':0 | number}}</b></ion-label>
			  	<ion-input type="number" [(ngModel)]="item.money" name="money" required [disabled]="isUpdateForm"></ion-input>
			  </ion-item>
			  <ion-item>
				  <ion-label floating>Start Time</ion-label>
				  <ion-datetime displayFormat="DD/MM/YYYY" [(ngModel)]="etem.created_date" name="created_date" [disabled]="isUpdateForm"></ion-datetime>
				</ion-item>
				<div class="floating">Spending type</div>
				<ion-item *ngIf="item.typeSpending" (click)="pickTypeSpending($event)">
	        <ion-avatar item-right class="savatar">
	          <div class="sico" [ngStyle]="{'background-position': item.typeSpending.sicon}"></div>
	        </ion-avatar>
	        <h2>{{item.typeSpending.name}}</h2>
	      </ion-item>
	      <div class="floating">Wallet <b *ngIf="item.wallet" [ngClass]="'spending'+(item.wallet.money >= 0 ? 1 : -1)">= {{item.wallet.money | convert:'number' | number}}</b></div>
	      <ion-item *ngIf="item.wallet" (click)="pickWallet($event)">      	
	      	<ion-label>{{item.wallet.name}}</ion-label>
	      	<ion-avatar item-right class="savatar">
	          <div class="sico" [ngStyle]="{'background-position': item.wallet.sicon}"></div>
	        </ion-avatar>        
	      </ion-item>			
			  <ion-item>
				  <ion-label>Include in total</ion-label>
				  <ion-checkbox [(ngModel)]="item.is_report" name="isReport" [disabled]="isUpdateForm"></ion-checkbox>
				</ion-item>
				<ion-item>
			    <ion-textarea type="text" [(ngModel)]="item.des" placeholder="Description" name="des"></ion-textarea>			    
			  </ion-item>		  
			</ion-list>
			<div padding>
				<button block type="submit">Save</button>
			</div>
		</form>		
	</ion-content>`,
	pipes: [ConvertPipe],
	styles: ['.title {padding: 16px 16px; background-color: #334D5C; color: #ccc; }', 'ul {list-style-type: circle; margin: 0; padding: 0;}', 'li { margin-left: 16px; line-height: 1.2em; }', '.floating { padding: 12px 16px 0px; color: #7f7f7f; font-size: 0.9em }'],
	directives: [TypeSpendingSelectComponent, WalletSelectComponent]
})
export class SpendingPage {
	item: any;
	etem: any = {};
	isUpdateForm: boolean = false;
	spending: Array<any> = [];
	earning: Array<any> = [];
	wallets: Array<any> = [];
	modalTypeSpending: any;
	modalWallet: any;
	errors: Array<any>;

  constructor(private viewController: ViewController, private navCtrl: NavController, navParams: NavParams, private dataProviderService: DataProviderService, private modalCtrl: ModalController, private alertController: AlertController, private events: Events) {
		var datePipe = new DatePipe();
		this.item = navParams.get('item');
		if (this.item === undefined || this.item.money === undefined) {
			this.item = {
				created_date: new Date().getTime(),
				is_report: 1
			};
			this.isUpdateForm = false;
		} else {
			this.isUpdateForm = true;
		}
		this.etem.created_date = datePipe.transform(new Date(this.item.created_date), 'yyyy-MM-dd');

		this.dataProviderService.Wallet.select('WHERE removed = 0 ORDER BY oder ASC').then(resp => {
			this.wallets = this.dataProviderService.toList(resp.res.rows);
			if (!this.item.wallet_id && this.wallets.length > 0) {
				this.item.wallet_id = this.wallets[0].ID;
				this.item.wallet = this.wallets[0];
			}
		}, error => { console.error(error); });

		this.dataProviderService.TypeSpending.select('WHERE removed = 0 AND (type = -1 OR type = 1) ORDER BY parent_id ASC, oder ASC').then(resp => {
			var typespendings = this.dataProviderService.toList(resp.res.rows);
			for (var t of typespendings) {
				if (t.type === 1) {
					this.earning.push(t);
				} else if (t.type === -1) {
					this.spending.push(t);
				}
			}
			if (!this.item.type_spending_id && this.spending.length > 0) {
				this.item.type_spending_id = this.spending[0].ID;
				this.item.typeSpending = this.spending[0];
			}
		});

  }

  getDateFromString(str) {
		str = str.split('-');
		return new Date(+str[0], +str[1] - 1, +str[2]);
  }

  cloneItem(item: any) {
		var item0 = {};
		for (var i in item) {
			if (i === 'wallet' || i === 'typeSpending') continue;
			item0[i] = item[i];
		}
		return item0;
  }

  save() {
		this.errors = [];
		if (!this.item.money) {
			this.errors.push('Money is required');
		}
		if (!this.item.created_date) {
			this.errors.push('Created date is required');
		}
		let alertCtrl;
		if (this.errors.length > 0) {
			alertCtrl = this.alertController.create({
				title: 'Error',
				subTitle: this.errors.join('<br/>'),
				buttons: ['OK']
			});
			alertCtrl.present();
    } else {
			this.item.created_date = this.getDateFromString(this.etem.created_date);
			this.item.created_day = this.item.created_date.getDate();
			this.item.created_month = this.item.created_date.getMonth();
			this.item.created_year = this.item.created_date.getFullYear();
			this.item.created_date = this.item.created_date.getTime();
			this.item.type = this.item.typeSpending.type;
			this.item.money = +this.item.money;
			if (this.item.ID) {
				this.dataProviderService.Spending.update(this.cloneItem(this.item)).then(resp => {
					this.events.publish('sync:to');
					this.viewController.dismiss(this.item);
				});
			} else {
				this.dataProviderService.Spending.add(this.cloneItem(this.item)).then(resp => {
					this.events.publish('sync:to');
					alertCtrl = this.alertController.create({
						title: 'Add more ?',
						message: 'Keep continue to add',
						buttons: ['Disagree',
							{
								text: 'Agree',
								handler: () => {
									delete this.item.money;
									delete this.item.description;
								}
							}
						]
					});
					alertCtrl.onDidDismiss(() => {
						if (this.item.money) {
							this.viewController.dismiss(this.item);
						}
					});
					alertCtrl.present();
				});
			}
		}
  }

  pickTypeSpending() {
		this.modalTypeSpending = this.modalCtrl.create(TypeSpendingSelectComponent, { earning: this.earning, spending: this.spending });
		this.modalTypeSpending.onDidDismiss(data => {
			this.item.type_spending_id = data.ID;
			this.item.typeSpending = data;
		});
		this.modalTypeSpending.present();
  }

  pickWallet() {
		this.modalWallet = this.modalCtrl.create(WalletSelectComponent, { data: this.wallets });
		this.modalWallet.onDidDismiss(data => {
			this.item.wallet_id = data.ID;
			this.item.wallet = data;
		});
		this.modalWallet.present();
  }

}
