import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';
declare let window: any;

@Component({
  selector: 'app-nft-detail',
  templateUrl: './nft-detail.component.html',
  styleUrls: ['./nft-detail.component.css']
})
export class NFTDetailComponent implements OnInit {

  NFTData:any = {};
  historyData:any = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) { }
  
   async ngOnInit() {
      let scripts = [];
      scripts = [
        "../../assets/js/jquery-3.5.1.min.js",
        "../../assets/js/bootstrap.bundle.min.js",
        "../../assets/js/owl.carousel.min.js",
        "../../assets/js/jquery.magnific-popup.min.js",
        "../../assets/js/select2.min.js",
        "../../assets/js/smooth-scrollbar.js",
        "../../assets/js/jquery.countdown.min.js",
        "../../assets/js/main.js",
      ];
  
      this._script.loadScripts("app-nft-detail", scripts).then(function () {
  
      })
  
      if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

        let id  =this._route.snapshot.params['id'];

        await this.getNFTViewData(id);
        
        await this.getBidHistory(id);

      } else {
        this.router.navigate([''])
      }
    }
  
    getNFTViewData(id:any){
      this.apiService.viewnft(id).subscribe(async (data: any) => {
        console.log('---data-----', data);
        if (data && data['data']) {
          let res = await data['data'];
          console.log('---res-----', res);
          this.NFTData = res;
  
        } else {
        
        }
      }, (error) => {
        if (error) {
  
        }
      })
    }
    // eBidStatus: "Bid"
    // nBidPrice: {$numberDecimal: "0.50000000"}
    // nQuantity: 1
    // oBidder: [{…}]
    // oNFTId: "61129d701bf84242a9127486"
    // oRecipient: [{…}]
    // sCreated: "2021-08-10T15:51:36.697Z"
    // _id: "6112a0881bf84242a91274e6"
//     aCollaborators: []
// oName: {sFirstname: "devX", sLastname: "devX"}
// sBio: "devXdevXdevXdevXdevXdevX"
// sCreated: "2021-08-10T15:47:52.307Z"
// sEmail: "devX@gmail.com"
// sRole: "user"
// sStatus: "active"
// sUserName: "devX"
// sWalletAddress: "0x79647CC2A785B63c2A7A5D324b2D15c0CA17115D"
// sWebsite: "www.devX.com"

    getBidHistory(id:any){
      this.apiService.bidHistory(id,{}).subscribe(async (data: any) => {
        console.log('---data-----', data);
        if (data && data['data']) {
          let res = await data['data'];
          console.log('---res-----', res);
          this.historyData = res;
  
        } else {
        
        }
      }, (error) => {
        if (error) {
  
        }
      })
    }

}
