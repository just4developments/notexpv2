import {Component, ViewChild, OnDestroy} from '@angular/core';
import {Platform, ionicBootstrap, Nav, Events, MenuController} from 'ionic-angular';
import {StatusBar, Facebook} from 'ionic-native';
import {DataProviderService} from './data-provider.service';
import {Pref} from './pref';
import {DashBoardPage} from './pages/dashboard';
import {SpendingPage} from './pages/spending';
import {ListTypeSpendingPage} from './pages/typespending';
import {ListWalletPage} from './pages/wallet';
import {LoginPage} from './pages/sign-in-up';

@Component({
  template: `<ion-menu [content]="content">
    <ion-toolbar>
      <ion-title>Menu</ion-title>
    </ion-toolbar>
    <ion-content>
      <ion-list>
        <button ion-item (click)="goto(0)">Dashboard</button>
        <!--button ion-item (click)="goto(1)">Spending today ?</button-->
        <button ion-item (click)="goto(2)">Type Spending</button>
        <button ion-item (click)="goto(3)">Wallet</button>
        <button ion-item (click)="logout()">Logout</button>
      </ion-list>
    </ion-content>
  </ion-menu>
  <!-- Disable swipe-to-go-back because it's poor UX to combine STGB with side menus -->
  <ion-nav [root]="rootPage" #content swipeBackEnabled="false"></ion-nav>`
})
class MyApp {
  @ViewChild(Nav) nav: Nav;
  private rootPage: any;
  private pages: Array<any> = [DashBoardPage, SpendingPage, ListTypeSpendingPage, ListWalletPage];

  constructor(private platform: Platform, private dataProviderService: DataProviderService, private events: Events, private menuController: MenuController) {
    Pref.setObject('me', {email: 'doanthuanthanh88@yahoo.com', symb: 'ABC'});
    this.rootPage = Pref.has('me') ? DashBoardPage : LoginPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Facebook.browserInit(1747907265472580, 'v2.7');
    });

    events.subscribe('sync:from', data => {
      this.syncFrom(t => {
        events.publish('synced:from', t);
      });
    });
    events.subscribe('sync:to', data => {
      this.syncTo(t => {
        events.publish('synced:to', t);
      });
    });
  }

  ngOnDestroy(){
    this.events.unsubscribe('sync:from', () => {});
    this.events.unsubscribe('sync:to', () => {});
  }

  syncTo(fcDone: Function){
    var t:number = 0;
    this.dataProviderService.Wallet.syncTo(c => {
      console.log(`Wallet synced ${c} to from server`);
      t += c;
      this.dataProviderService.TypeSpending.syncTo(c => {
        console.log(`TypeSpending synced ${c} to from server`);
        t += c;
        this.dataProviderService.Spending.syncTo(c => {
          console.log(`Spending synced ${c} to from server`);
          t += c;
          fcDone(t);
        });
      });
    });
  }

  syncFrom(fcDone: Function){
    var t:number = 0;
    this.dataProviderService.Wallet.syncFrom(1, 50, c => {
      console.log(`Wallet synced ${c} records from server`);
      t += c;
      this.dataProviderService.TypeSpending.syncFrom(1, 50, c => {
        console.log(`TypeSpending synced ${c} records from server`);
        t += c;
        this.dataProviderService.Spending.syncFrom(1, 50, c => {
          console.log(`Spending synced ${c} records from server`);
          t += c;
          fcDone(t);
        });
      });
    });    
  }

  goto(i: number){
    this.menuController.close();
    this.nav.setRoot(this.pages[i]);
  }

  logout(){    
    Facebook.logout().then(res => {
      console.log(res);
      this.dataProviderService.logout(res => {
        this.nav.setRoot(LoginPage);   
      });
    });    
  }
}

ionicBootstrap(MyApp, [DataProviderService]);