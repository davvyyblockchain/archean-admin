import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error } from 'jquery';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { parse } from 'path';
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
  // console.log('---aNFT------',aNFT.sCollectionDetail)

  NFTData: any = {};
  historyData: any = [];
  collaboratorList: any = [];

  bidForm: any;
  submitted1: Boolean = false;

  transferForm: any;
  submitted2: Boolean = false;

  buyForm: any;
  submitted3: Boolean = false;


  showObj: any = {
    wallet_address: localStorage.getItem('sWalletAddress'),
    showBidCurrent: 'show',
    showTransferCurrent: 'hide',
    showBuyCurrent: 'show',

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
    this.buildTransferForm();
    this.buildBUYForm();

    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      let id = this._route.snapshot.params['id'];

      await this.getNFTViewData(id);

      await this.getBidHistory(id);
      await this.getColoboraterList();
      // let obj = {
      //   eBidStatus: "Bid",
      //   nBidPrice: 1.1,
      //   nQuantity: "1",
      //   nTokenID: 27,
      //   oNFTId: "611e8aaea867e7282e50512e",
      //   oRecipient: "611417d43185a6468b27adea",
      //   sOwnerEmail: "davvy@blockchainaustralia.com.au",
      //   sTransactionHash: "0xf5af14b4bb17bc97de6c493de3c158cdc8b485cfa2a2b67f9b13bb223f057a54",
      // }
      // await this.apiService.bidCreate(obj).subscribe(async (transData: any) => {
      //   if (transData && transData['data']) {
      //   } else {
      //     this.toaster.success(transData['message']);
      //   }
      // })
      // this.apiService.getBehaviorView().subscribe((e:any)=>{
      //     if(e){
      //       console.log('------------e----------',e.wallet_address);

      //     }
      // })
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

  buildTransferForm() {
    this.transferForm = this._formBuilder.group({
      nQuantity: ['', [Validators.required]],
      oRecipient: ['', [Validators.required]],
    });
  }
  buildBUYForm() {
    this.buyForm = this._formBuilder.group({
      nQuantity: ['', [Validators.required]],
      nBidPrice: [{ value: '', disabled: true }, [Validators.required]],
    });
  }

  getColoboraterList() {
    this.apiService.getColoboraterList().subscribe((res: any) => {
      if (res && res['data']) {
        this.collaboratorList = res['data'];
      }
    }, (err: any) => {
    });
  }

  getNFTViewData(id: any) {
    this.apiService.viewnft(id).subscribe(async (data: any) => {
      if (data && data['data']) {
        let res = await data['data'];
        this.NFTData = res;
        if ((this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sWalletAddress == this.showObj.wallet_address) || (this.NFTData.eAuctionType == 'Fixed Sale')) {
          this.showObj.showBidCurrent = 'hide';
        }
        if (this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sWalletAddress == this.showObj.wallet_address) {
          this.showObj.showTransferCurrent = 'show';
        }

        if (this.NFTData.eAuctionType == 'Auction' || this.NFTData.eAuctionType == '' || (this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sWalletAddress == this.showObj.wallet_address)) {
          this.showObj.showBuyCurrent = 'hide';
        }


        if (this.NFTData.nBasePrice && this.NFTData.nBasePrice != undefined) {

          this.buyForm.patchValue({ 'nBidPrice': this.NFTData.nBasePrice['$numberDecimal'] })
        }



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
      console.log('---history-----', data)
      if (data && data['data']) {
        let res = await data['data'];
        this.historyData = res['data'];

      } else {

      }
    }, (error) => {
      if (error) {

      }
    })
  }

  // {{NFTData.nBasePrice && NFTData.nBasePrice != undefined ?
  //   NFTData.nBasePrice['$numberDecimal'] :'-' }} 
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
  checkBuyQNTT(e: any) {
    if (e.target.value) {
      if (parseFloat(e.target.value) <= (parseInt(this.NFTData.nQuantity))) {

      } else {

        this.transferForm.patchValue({ 'nQuantity': '' });
        this.toaster.info('Amount exceeding NFT quantity.')
      }
    } else {
      this.transferForm.patchValue({ 'nQuantity': '' });
    }

  }

  checkBuyBQNT(e: any) {
    if (e.target.value) {
      if (parseFloat(e.target.value) <= (parseInt(this.NFTData.nQuantity))) {

      } else {

        this.buyForm.patchValue({ 'nQuantity': '' });
        this.toaster.info('Amount exceeding NFT quantity.')
      }
    } else {
      this.buyForm.patchValue({ 'nQuantity': '' });
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
      let res = this.bidForm.value;
      if (parseFloat(res.nBidPrice) >= parseFloat(this.NFTData.nBasePrice['$numberDecimal'])) {

        let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
          this.NFTData.nTokenID : 1;
        let price: any = parseFloat(res.nBidPrice) * parseFloat(res.nQuantity);
        let obj = {
          oRecipient: this.NFTData['oCurrentOwner']['_id'],
          eBidStatus: this.NFTData['eAuctionType'] == "Fixed Sale" ? 'Sold' : 'Bid',
          nBidPrice: parseFloat(price),
          nQuantity: res.nQuantity,
          oNFTId: this.NFTData['_id'],
          sTransactionHash: '',
          nTokenID: nTokenID,
          sOwnerEmail: this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sEmail &&
            this.NFTData.oCurrentOwner.sEmail != undefined ?
            this.NFTData.oCurrentOwner.sEmail : '-'
        };
        this.spinner.show();
        var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
        if (NFTinstance && NFTinstance != undefined) {
          this.spinner.hide();

          this.spinner.show();
          NFTinstance.methods.bid(nTokenID, obj['nQuantity'], this.NFTData.oCurrentOwner.sWalletAddress)
            .send({
              from: this.showObj.wallet_address,
              value: window.web3.utils.toWei(`${obj.nBidPrice}`, 'ether')
            })
            .on('transactionHash', async (hash: any) => {
              obj["sTransactionHash"] = hash;

              await this.apiService.bidCreate(obj).subscribe(async (transData: any) => {
                this.spinner.hide();
                if (transData && transData['data']) {
                  this.toaster.success('Bid created successfully');
                  this.onClickRefresh();
                } else {
                  this.toaster.success(transData['message']);
                }
              })
            })
            .catch((error: any) => {
              
              this.toaster["error"]((error.code == 4001) ? "You Denied MetaMask Transaction Signature" : "Something Went Wrong!");
            });

        } else {
          this.spinner.hide();
          this.toaster.error("There is something issue with NFT address.");

        }
      } else {
        this.spinner.hide();

        this.bidForm.patchValue({ 'nBidPrice': '' });
        this.toaster.info('Please enter minimum & greater then minimum Bid amount.')
      }

    }
  }

  onClickRefresh() {
    window.location.reload();
  }


  async onClickSubmitTransfer() {

    this.spinner.show();
    this.submitted2 = true;
    if (this.transferForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      let res = this.transferForm.value;

      let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
        this.NFTData.nTokenID : 1;
      let obj = {
        oRecipient: res.oRecipient,
        eBidStatus: 'Transfer',
        nBidPrice: '0',
        nQuantity: res.nQuantity,
        oNFTId: this.NFTData['_id'],
        sTransactionHash: '',
        nTokenID: nTokenID
      };
      this.spinner.show();
      var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
      if (NFTinstance && NFTinstance != undefined) {
        this.spinner.hide();
        this.spinner.show();
        NFTinstance.methods.transfer(nTokenID, res.oRecipient, obj['nQuantity'])
          .send({
            from: this.showObj.wallet_address
          })
          .on('transactionHash', async (hash: any) => {
            obj["sTransactionHash"] = hash;

            await this.apiService.bidCreate(obj).subscribe(async (transData: any) => {
              this.spinner.hide();
              if (transData && transData['data']) {
                this.toaster.success('NFT transfered successfully');
                this.router.navigate(['/']);
                this.onClickRefresh();
              } else {
                this.toaster.success(transData['message']);
              }
            })
          })
          .catch((error: any) => {
            
            this.toaster["error"]((error.code == 4001) ? "You Denied MetaMask Transaction Signature" : "Something Went Wrong!");
          });

      } else {
        this.spinner.hide();
        this.toaster.error("There is something issue with NFT address.");

      }


    }
  }

  async onClickSubmitBUY() {

    this.spinner.show();
    this.submitted3 = true;
    if (this.buyForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      let res = this.buyForm.value;
      if (parseFloat(res.nBidPrice) >= parseFloat(this.NFTData.nBasePrice['$numberDecimal'])) {

        let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ? this.NFTData.nTokenID : 1;
        let price: any = parseFloat(res.nBidPrice) * parseFloat(res.nQuantity);
        let obj = {
          oRecipient: this.NFTData['oCurrentOwner']['_id'],
          eBidStatus: this.NFTData['eAuctionType'] == "Fixed Sale" ? 'Sold' : 'Bid',
          nBidPrice: parseFloat(price),
          nQuantity: res.nQuantity,
          oNFTId: this.NFTData['_id'],
          sTransactionHash: '',
          nTokenID: nTokenID,
          sOwnerEmail: this.NFTData.oCurrentOwner && this.NFTData.oCurrentOwner.sEmail &&
            this.NFTData.oCurrentOwner.sEmail != undefined ?
            this.NFTData.oCurrentOwner.sEmail : '-'
        };
        this.spinner.show();
        var NFTinstance = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
        if (NFTinstance && NFTinstance != undefined) {
          this.spinner.hide();

          this.spinner.show();
          NFTinstance.methods.buyNow(nTokenID, this.NFTData.oCurrentOwner.sWalletAddress, this.showObj.wallet_address, obj['nQuantity'])
            .send({
              from: this.showObj.wallet_address,
              value: window.web3.utils.toWei(`${obj.nBidPrice}`, 'ether')
            })
            .on('transactionHash', async (hash: any) => {
              obj["sTransactionHash"] = hash;

              await this.apiService.bidCreate(obj).subscribe(async (transData: any) => {
                this.spinner.hide();
                if (transData && transData['data']) {
                  this.toaster.success('Bid created successfully');
                  this.onClickRefresh();
                } else {
                  this.toaster.success(transData['message']);
                }
              })
            })
            .catch((error: any) => {
              
              this.toaster["error"]((error.code == 4001) ? "You Denied MetaMask Transaction Signature" : "Something Went Wrong!");
            });

        } else {
          this.spinner.hide();
          this.toaster.error("There is something issue with NFT address.");

        }
      } else {
        this.spinner.hide();

        this.bidForm.patchValue({ 'nBidPrice': '' });
        this.toaster.info('Please enter minimum & greater then minimum Bid amount.')
      }

    }
  }


  async clickAccept(obj: any) {
    let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
      this.NFTData.nTokenID : 1;

    let oOptions = {
      sObjectId: obj._id,
      oBidderId: obj.oBidder._id,
      oNFTId: this.NFTData['_id'],
      eBidStatus: 'Accepted',
      sTransactionHash: ''
    }

    this.spinner.show();
    var oContract = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
    if (oContract && oContract != undefined) {

      console.log(this.showObj.wallet_address);

      oContract.methods.acceptBid(nTokenID, obj.oBidder.sWalletAddress, obj.nQuantity)
        .send({
          from: this.showObj.wallet_address
        }).on('transactionHash', async (hash: any) => {
          this.spinner.hide();
          oOptions["sTransactionHash"] = hash;
          await this.sendData(oOptions);
        }).catch((error: any) => {
          this.spinner.hide();
          
          if(error && error.code  == 4001){
            this.toaster.error(error['message'])
          }
        });
    } else {
      this.spinner.hide();
      this.toaster.error("There is something issue with NFT address.");

    }
  }
  async clickReject(obj: any) {
    let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
      this.NFTData.nTokenID : 1;

    let oOptions = {
      sObjectId: obj._id,
      oBidderId: obj.oBidder._id,
      oNFTId: this.NFTData['_id'],
      eBidStatus: 'Rejected',
      sTransactionHash: ''
    }

    this.spinner.show();
    var oContract = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
    if (oContract && oContract != undefined) {
      oContract.methods.rejectBid(nTokenID, obj.oBidder.sWalletAddress)
        .send({
          from: this.showObj.wallet_address
        }).on('transactionHash', async (hash: any) => {
          this.spinner.hide();
          oOptions["sTransactionHash"] = hash;
          await this.sendData(oOptions);
        }).catch((error: any) => {
          this.spinner.hide();
          if(error && error.code  == 4001){
            this.toaster.error(error['message'])
          }
          
        });
    } else {
      this.spinner.hide();
      this.toaster.error("There is something issue with NFT address.");

    }
  }

  async clickCancel(obj: any) {
    let nTokenID = await this.NFTData.nTokenID && this.NFTData.nTokenID != undefined ?
      this.NFTData.nTokenID : 1;

    let oOptions = {
      sObjectId: obj._id,
      oBidderId: obj.oBidder._id,
      oNFTId: this.NFTData['_id'],
      eBidStatus: 'Canceled',
      sTransactionHash: ''
    }

    this.spinner.show();
    var oContract = await this.apiService.exportInstance(environment.NFTaddress, environment.NFTabi);
    if (oContract && oContract != undefined) {
      oContract.methods.cancelBid(nTokenID, this.NFTData.oCurrentOwner.sWalletAddress)
        .send({
          from: this.showObj.wallet_address
        }).on('transactionHash', async (hash: any) => {
          this.spinner.hide();
          oOptions["sTransactionHash"] = hash;
          await this.sendData(oOptions);
        }).catch((error: any) => {
          this.spinner.hide();
          if(error && error.code  == 4001){
            this.toaster.error(error['message'])
          }
          
        });
    } else {
      this.spinner.hide();
      this.toaster.error("There is something issue with NFT address.");

    }
  }


  async sendData(opt: any) {
    this.spinner.show();
    await this.apiService.toggleBidStatus(opt).subscribe(async (transData: any) => {
      this.spinner.hide();
      if (transData && transData['data']) {
        this.toaster.success(transData['message']);
        this.onClickRefresh();
      } else {
        this.toaster.success(transData['message']);
      }
    })
  }


}