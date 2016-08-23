import {Component} from '@angular/core';
import {NavController, NavParams, ModalController} from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';
import {ListSpendingComponent} from './list-spendings.component';
import {ReportSpendingComponent} from './report-spending.component';
import {SpendingPage} from '../spending';
import {Utils} from '../../utils.service';

@Component({
  template: `<ion-header>
	  <ion-navbar>
	    <ion-title>DASHBOARD</ion-title>
	  </ion-navbar>
	</ion-header>
	<ion-content>
		<report-spending [data]="totalSpendings" *ngIf="totalSpendings" (next)="next()" (prev)="prev()"></report-spending>
		<br/>
		<ul class="title">
			<li>Swipe left to edit or remove item</li>
			<li>Click on the icon which you want to filter</li>
		</ul>
	  <list-spendings [data]="spendings" [typespendings]="typespendings" [wallets]="wallets" *ngIf="spendings"></list-spendings>
	  <button fab class="createNew" (click)="gotoCreateNew()"><ion-icon name="add"></ion-icon></button>
	</ion-content>`,
	styles: ['.createNew { position: fixed; bottom: 10px; right: 10px; } '],
	directives: [ListSpendingComponent, ReportSpendingComponent]
})
export class DashBoardPage {
	totalSpendings: any;
	spendings: Array<any>;
	typespendings: Array<any>;
	wallets: Array<any>;
	now = new Date();	

  constructor(private modalController: ModalController, private navCtrl: NavController, private dataProviderService: DataProviderService, private navPrams: NavParams) {  	
  	this.loadData(this.now.getMonth(), this.now.getFullYear());
  }

  loadData(month:number, year:number){
  	this.spendings = new Array<any>();
  	var totalSpendings = { earning: 0, spending: 0, remaining: 0, month: month, year: year};
  	this.dataProviderService.Wallet.select().then(resp => {
  		this.wallets = this.dataProviderService.toList(resp.res.rows);
	  	this.dataProviderService.TypeSpending.select().then(resp => {
	  		this.typespendings = this.dataProviderService.toList(resp.res.rows);
	  		this.dataProviderService.Spending.select('WHERE created_year = ? AND created_month = ? AND removed = 0 ORDER BY created_date DESC', [year, month]).then(resp => {
		  		var spendings = this.dataProviderService.toList(resp.res.rows);
		  		var day;
		  		for(var i =0; i< spendings.length; i++){
		  			var item = spendings[i];
		  			item.typeSpending = Utils.find(this.typespendings, e => { return e.ID === item.type_spending_id; })[0];		  			
		  			item.wallet = Utils.find(this.wallets, e => { return e.ID === item.wallet_id; })[0];
		  			if(!day) day = { day: item.created_day, month: item.created_month, year: item.created_year, date: new Date(item.created_date), earning: 0, spending: 0, data: [] };
	  				else if(day.day !== item.created_day || day.month !== item.created_month || day.year !== item.created_year){
	  					totalSpendings.earning += day.earning;
  						totalSpendings.spending += day.spending;
	  					this.spendings.push(day);
	  					day = { day: item.created_day, month: item.created_month, year: item.created_year, date: new Date(item.created_date), earning: 0, spending: 0, data: [] };
	  				}
  					if(item.type > 0) day.earning += item.money;
  					else if(item.type < 0) day.spending += item.money;
  					day.data.push(item);
		  		}
		  		if(day !== undefined){
		  			totalSpendings.earning += day.earning;
  					totalSpendings.spending += day.spending;
		  			this.spendings.push(day);
		  		}
		  		totalSpendings.remaining = totalSpendings.earning - totalSpendings.spending;
		  		this.totalSpendings = totalSpendings;
		  	}, error => { console.error(error); });
	  	});
	  }, error => { console.error(error); });
  }

  next(){
  	this.now.setMonth(this.now.getMonth()+1);
  	this.loadData(this.now.getMonth(), this.now.getFullYear());
  }

  prev(){
  	this.now.setMonth(this.now.getMonth()-1);
  	this.loadData(this.now.getMonth(), this.now.getFullYear());
  }

  gotoCreateNew() {
  	let modal = this.modalController.create(SpendingPage, {item: undefined});
    modal.onDidDismiss(data => {
      console.log(data);
    });
    modal.present();
  }

}
