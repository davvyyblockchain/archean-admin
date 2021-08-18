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

  NFTData: any = {};
  historyData: any = [];

  bidForm: any;
  submitted1: Boolean = false;
  showObj: any = {
    wallet_address: localStorage.getItem('sWalletAddress')
  }
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
    this.buildBidForm();
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
      console.log('------NFTinstance-------------', NFTinstance)
      let id = this._route.snapshot.params['id'];

      await this.getNFTViewData(id);

      await this.getBidHistory(id);

    } else {
      // this.router.navigate([''])
    }
  }

  buildBidForm() {
    this.bidForm = this._formBuilder.group({
      nQuantity: ['', [Validators.required]],
      nBidPrice: ['', [Validators.required]],
    });
  }

  getNFTViewData(id: any) {
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

  getBidHistory(id: any) {
    this.apiService.bidHistory(id, {}).subscribe(async (data: any) => {
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


  checkBuyQNT(e: any) {
    if (e.target.value) {
      if (parseFloat(e.target.value) <= (parseInt(this.NFTData.nQuantity))) {

      } else {

        this.bidForm.patchValue({ 'nQuantity': '' });
        this.toaster.info('Amount exceeding NFT quantity.')
      }
    } else {
      this.bidForm.patchValue({ 'nQuantity': '' });
    }

  }
  // nQuantity: ['', [Validators.required]],
  // nBidPrice: ['', [Validators.required]],
  async onClickSubmitBID() {

    this.spinner.show();
    this.submitted1 = true;
    if (this.bidForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      let nTokenID = 1
      let res = this.bidForm.value;
      let obj = {
        oRecipient: this.NFTData['oCurrentOwner']['_id'],
        eBidStatus: this.NFTData['eAuctionType'] == "Fixed Sale" ? 'Sold' : 'Bid',
        nBidPrice: res.nBidPrice,
        nQuantity: res.nQuantity,
        oNFTId: this.NFTData['_id'],
        sTransactionHash: '',
        nTokenID: nTokenID
      };
      this.spinner.show();
      var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);

      if (NFTinstance && NFTinstance != undefined) {
        this.spinner.hide();


        NFTinstance.methods.bid(nTokenID, obj['nQuantity'], this.showObj.wallet_address)
          .send({
            from: window.sessionStorage.getItem("sWalletAddress"),
            value: window.Web3.utils.toWei(res.nBidPrice, 'ether')
          })
          .on('transactionHash', async (hash: any) => {
            obj["sTransactionHash"] = hash;

            await this.apiService.bidCreate(obj).subscribe(async (transData: any) => {
              this.spinner.hide();
              if (transData && transData['data']) {
                this.toaster.success('NFT created successfully');
                this.onClickRefresh();
              } else {
                this.toaster.success(transData['message']);
              }
            })
          })
          .catch((error: any) => {
            console.log(error);
            this.toaster["error"]((error.code == 4001) ? "You Denied MetaMask Transaction Signature" : "Something Went Wrong!");
          });

      } else {
        this.spinner.hide();
        this.toaster.error("There is something issue with NFT address.");

      }



      console.log('-------------res', res);


    }

  }

  onClickRefresh() {
    window.location.reload();
  }
}

// 
// 6101359253aae00a0d01271e 
// eBidStatus:
// oNFTId: 6101368d53aae00a0d012798 this.NFTData['_id']
// : 0.10000000
// nTokenID: 15
// sOwnerEmail: this.NFTData['oCurrentOwner']['sEmail'] yashgajjar17.yg@gmail.com
// nQuantity: 1
// sTransactionHash: 0xa7c2da411f29b64555f50cfdb8ecff7af7639256c5bd46cdd481cfe94243ad71

