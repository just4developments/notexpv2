import {Component, Input, OnInit, Output, OnDestroy} from '@angular/core';
import {ModalController, AlertController, NavController, Events} from 'ionic-angular';
import {DataProviderService} from '../../data-provider.service';
import {FBConnector} from './FBConnector';
import {SetupComponent} from './';
import {DashBoardPage} from '../dashboard';

declare var FB: any;

@Component({
  template: `<ion-header>
    <ion-navbar>
      <ion-title>LOGIN <small>NOTEXPV2</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>     
    <ion-grid>
      <ion-row>
        <ion-col width-100>
          <ion-list radio-group>
            <ion-list-header>Language</ion-list-header>
            <ion-item>
              <ion-label>English</ion-label>
              <ion-radio value="en"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>Vietnamese</ion-label>
              <ion-radio value="vi"></ion-radio>
            </ion-item>
          </ion-list>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col width-50 align="center">
          <button (click)="loginF()" fab><ion-icon name="logo-facebook"></ion-icon></button>
        </ion-col>
        <ion-col width-50 align="center">
          <button (click)="loginG()" fab danger><ion-icon name="logo-googleplus"></ion-icon></button>
        </ion-col>        
      </ion-row>
    </ion-grid>
  </ion-content>`,
  styles: ['button {position: initial; padding: 40px}', 'ion-icon {font-size: 3em;}']
})
export class LoginPage implements OnDestroy {
  static isLogin:boolean;
  constructor(private navController:NavController, private alertController: AlertController, private dataProviderService: DataProviderService, private modalController: ModalController, private events: Events){     
    var fbCon: FBConnector = new FBConnector();
    fbCon.initFB();

    LoginPage.isLogin = true;

    this.events.subscribe('synced:from', data => {
      console.log(`Synced ${data[0]} records from server`);
      this.loginDone();
    });

    this.events.subscribe('synced:to', data => {
      console.log(`Synced ${data[0]} records to server`);
      this.loginDone();
    });
  }

  ngOnDestroy(){
    delete LoginPage.isLogin;
    this.events.unsubscribe('synced:from', () => {});
    this.events.unsubscribe('synced:to', () => {});
  }

  init(fcDone: Function){
    this.dataProviderService.Wallet.init(() => {
      console.log('Wallet scheme created');
      this.dataProviderService.TypeSpending.init(() => {
        console.log('TypeSpending scheme created');
        this.dataProviderService.Spending.init(() => {
          console.log('Spending scheme created');
          fcDone();
        });
      });
    });
  }

  install(lang:string, fcDone: Function){
    this.dataProviderService.Wallet.install(lang, () => {
      console.log('Wallet installed');
      this.dataProviderService.TypeSpending.install(lang, () => {
        console.log('TypeSpending installed');
        fcDone();
      });
    });
  }

  login(user, isFirst){
    // user.email = 'have.ice@gmail.com';
    var self = this;
    let modal = this.modalController.create(SetupComponent, {me: user});
    modal.onDidDismiss(lang => {
      user.lang = lang;
      user.symb = user.lang === 'vi' ? 'VND' : 'USD';  
      this.dataProviderService.setMe(user);
      this.init(() => {
        if(isFirst){
          this.install(user.lang, () => {
            this.events.publish('sync:to');
          });
        }else{
          this.events.publish('sync:from');
        }        
      });   

    });    
    modal.present();
  }

  reLogin(user){
    this.events.publish('sync:from');
  }

  loginDone(){     
    if(LoginPage.isLogin) this.navController.setRoot(DashBoardPage);
  }

  loginF(){
    var self = this;
  	FB.login(res => {
      FB.api('/me', {fields: 'name, email'}, function(response) {
        self.dataProviderService.login(response).subscribe(res => {
          var user = res.json();                    
          self.login(user, user.isNew);                 
        });        
      });
    });
  }

  loginG(){
    
  }

}