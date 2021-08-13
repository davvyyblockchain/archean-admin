import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';


@Component({
  selector: 'app-create-nft',
  templateUrl: './create-nft.component.html',
  styleUrls: ['./create-nft.component.css']
})
export class CreateNFTComponent implements OnInit {

  profileData: any;

  collectionList: any = [];
  categoriesList: any = [];
  collaboratorList: any = [];

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

    this._script.loadScripts("app-create-nft", scripts).then(function () {

    })
console.log('---------------create-nft-------------',localStorage.getItem('Authorization') )
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      console.log('---------------create 1-------------')

      await this.getProfile();
      await this.getCollectionList();
      await this.getCategories();
      await this.getColoboraterList();

    }


    // nft/collectionlist   API first
    // user/categories
    // /user/getCollaboratorList\
    // http://165.22.244.82:3000/api/v1/user/profile

    // fd.append('nftFile', files[0]);

    // fd.append('sName', sName);
    // fd.append('sCollection', sCollection);
    // fd.append('eType', eType); category
    // fd.append('nQuantity', nQuantity);
    // fd.append('sCollaborator', aCollaboratorAddresses);
    // fd.append('nCollaboratorPercentage', aCollaboratorPercentages);
    // fd.append('sSetRoyaltyPercentage', sSetRroyalityPercentage);
    // fd.append('sNftdescription', sNftdescription);
    // fd.append('eAuctionType', eAuctionType);
    // fd.append('nBasePrice', nBasePrice);



    //       nftFile: (binary)
    // sName: MNNN
    // sCollection: 
    // eType: Audio
    // nQuantity: 10
    // sCollaborator: 0x5138d8D462DC20b371b5df7588099e46d8c177A3
    // nCollaboratorPercentage: 100
    // sSetRoyaltyPercentage: 0.1
    // sNftdescription: cdsgvxfcbgsdfg
    // eAuctionType: Auction
    // nBasePrice: 0.1

  }


  getProfile() {
    this.apiService.getprofile().subscribe((res: any) => {
      if (res && res['data']) {
        this.profileData = res['data'];
        this.profileData.sProfilePicUrl = this.profileData.sProfilePicUrl == undefined ? 'assets/img/avatars/avatar5.jpg' : 'https://ipfs.io/ipfs/' + this.profileData.sProfilePicUrl;
        this.profileData.sFirstname = this.profileData && this.profileData.oName && this.profileData.oName.sFirstname ? this.profileData.oName.sFirstname : '';
        this.profileData.sLastname = this.profileData && this.profileData.oName && this.profileData.oName.sLastname ? this.profileData.oName.sLastname : '';
      }
    }, (err: any) => {
      console.log('-----err--------', err)
    });
  }

  getCollectionList() {
    this.apiService.getCollectionList().subscribe((res: any) => {
      if (res && res['data']) {
        this.collectionList = res['data'];
      }
    }, (err: any) => {
      console.log('-----err--------', err)
    });
  }


  getCategories() {
    this.apiService.getCategories().subscribe((res: any) => {
      if (res && res['data']) {
        this.categoriesList = res['data'];
      }
    }, (err: any) => {
      console.log('-----err--------', err)
    });
  }


  getColoboraterList() {
    this.apiService.getColoboraterList().subscribe((res: any) => {
      if (res && res['data']) {
        this.collaboratorList = res['data'];
      }
    }, (err: any) => {
      console.log('-----err--------', err)
    });
  }


}
