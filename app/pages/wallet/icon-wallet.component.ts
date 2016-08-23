import {Component} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';

@Component({
  template: `<ion-header>
    <ion-navbar>
      <ion-title>PICK <small>ICON</small></ion-title>
    </ion-navbar>
  </ion-header>
  <ion-content>
    <div>
      <button *ngFor="let icon of icons" class="ico" fab light [ngStyle]="{'background-position': icon.icon}" (click)="pick(icon)"></button>
    </div>
  </ion-content>`,
  styles: ['div { padding: 5px; }', '.ico { float : left; position: static; }']
})
export class IconWalletComponent {
  icons: Array<any> = [];

  constructor(navParams: NavParams, private viewController: ViewController){
    var left = 53;
    var top = 64;
    var sleft = 24*53/36;
    var stop = 24*64/36;
    var nw = 13, nh = 12;
    var max = nw * nh - 3;
    for(var j=0; j<nw; j++){
      for(var i=0; i<nh; i++){
        if(--max === 0) break;
        this.icons.push({
          icon: `-${j * left}px -${i * top}px`,
          sicon: `-${j * sleft}px -${i * stop}px`,
        });
      }
      if(max === 0) break;
    }
  }

  pick(icon: string){
    this.viewController.dismiss(icon);
  }
}