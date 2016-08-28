import {Component, OnDestroy} from '@angular/core';
import {ModalController, AlertController, NavController, Events, MenuController} from 'ionic-angular';
import {Facebook, FacebookLoginResponse, GooglePlus} from 'ionic-native';
import {DataProviderService} from '../../data-provider.service';
import {SetupComponent} from './';
import {DashBoardPage} from '../dashboard';

@Component({
  template: `<ion-header>
    <ion-navbar>
      <ion-title>LOGIN <small>NOTEXPV2</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>
    <ion-grid>
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

  constructor(private menuController: MenuController, private navController:NavController, private alertController: AlertController, private dataProviderService: DataProviderService, private modalController: ModalController, private events: Events){
    this.menuController.enable(false);

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

  login(user: any, isFirst: boolean){
    let modal = this.modalController.create(SetupComponent, {me: user});
    modal.onDidDismiss(me => {
      DataProviderService.loading(true).then(()=>{
        user = me;
        this.dataProviderService.setMe(user);
        this.init(() => {
          if (isFirst){
            this.install(user.lang, () => {
              this.events.publish('sync:to');
            });
          }else{
            this.events.publish('sync:from');
          }
        });
      });
    });
    modal.present();
  }

  reLogin(user){
    this.events.publish('sync:from');
  }

  loginDone(){
    DataProviderService.loading(false).then(()=>{
      if(LoginPage.isLogin) this.navController.setRoot(DashBoardPage);
    });
  }

  loginF(){
    var self = this;
    Facebook.login(['email', 'public_profile']).then(
      (response: FacebookLoginResponse) => {
        Facebook.api('/me', []).then((response) => {
          console.log(response);
          self.dataProviderService.login(response).subscribe(res => {
            var user = res.json();
            self.login(user, user.isNew);
          });
        });
      },
      (error: any) => console.error(error)
    );
  }

  loginG(){
    var self = this;
    console.log('Login google');
    console.log(GooglePlus);
    GooglePlus.login().then(
      (response: any) => {        
        console.log('res', response);
        // self.dataProviderService.login(response).subscribe(res => {
        //   var user = res.json();
        //   self.login(user, user.isNew);
        // });
      },
      (error: any) => console.error('Err', error)
    );
  }

  onPageWillLeave() {
    this.menuController.enable(true);
  }

}
