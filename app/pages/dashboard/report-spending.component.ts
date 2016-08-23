import {Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChange} from '@angular/core';
import {NavController} from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';

@Component({
	selector: 'report-spending',
  template: `<ion-card>
	  <ion-card-header>
	  	<button clear (click)="prev()"><ion-icon name="arrow-dropleft"></ion-icon></button>
	    <button clear>{{total.month+1}}, {{total.year}}</button>
	    <button clear (click)="next()" *ngIf="total.year <= now.getFullYear() && total.month < now.getMonth()"><ion-icon name="arrow-dropright"></ion-icon></button>
	  </ion-card-header>
  	<ion-list>
  		<ion-item class="spending1">
  			<ion-icon name="arrow-forward" item-left></ion-icon>
  			Received
  			<ion-note item-right="">+ {{total.earning | number}}</ion-note>  			
  		</ion-item>
  		<ion-item class="spending-1">
  			<ion-icon name="arrow-back" item-left></ion-icon>
  			Spent
  			<ion-note item-right="">- {{total.spending | number}}</ion-note>
  		</ion-item>
  		<ion-item class="spending0">
  			<ion-icon name="stats" item-left></ion-icon>
  			Remaining
  			<ion-note item-right=""><b>{{sign > 0 ? '+' : (sign < 0 ? '-' : '')}} {{total.remaining | number}}</b></ion-note>
  		</ion-item>
  	</ion-list>
	</ion-card>`,
	styles: ['ion-note { color: inherit }']
})
export class ReportSpendingComponent implements OnChanges {
	@Input('data') total;
  @Output('next') nextEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output('prev') prevEvent: EventEmitter<any> = new EventEmitter<any>();
  now: Date;
	sign: number = 0;

  constructor(private navCtrl: NavController, private dataProviderService: DataProviderService) {
  	this.now = new Date();
  }

  next(){
    this.nextEvent.emit(null);
  }

  prev(){
    this.prevEvent.emit(null);
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    this.sign = this.total.remaining > 0 ? 1 : (this.total.remaining < 0 ? -1 : 0);
    this.total.remaining *= this.sign;
  }

}
