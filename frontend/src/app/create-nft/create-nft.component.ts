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
  form: any = 'NFT';

  createNFTForm: any;
  submitted3: Boolean = false;
  file: any;

  createCollectionForm: any;
  submitted1: Boolean = false;
  nftFile: any;


  createCollaboratorForm: any;
  submitted2: Boolean = false;


  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) { }
  clickSetForm(type: any) {
    this.form = type;
  }

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
    console.log('---------------create-nft-------------', localStorage.getItem('Authorization'))
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {
      console.log('---------------create 1-------------')
      this.buildCreateCollectionForm();
      this.buildCreateCollaboratorForm();
      this.buildCreateNFTForm();


      await this.getProfile();
      await this.getCollectionList();
      await this.getCategories();
      await this.getColoboraterList();

    } else {
      this.router.navigate([''])
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

    // sCollaborator: 0x5138d8D462DC20b371b5df7588099e46d8c177A3
    // nCollaboratorPercentage: 100
    // sSetRoyaltyPercentage: 0.1

  }


  buildCreateCollectionForm() {

    this.createCollectionForm = this._formBuilder.group({
      sName: ['', [Validators.required]],
      sDescription: ['', [Validators.required]],
    });
  }

  buildCreateCollaboratorForm() {

    this.createCollaboratorForm = this._formBuilder.group({
      sFullname: ['', [Validators.required]],
      sAddress: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
    });
  }


  buildCreateNFTForm() {

    this.createNFTForm = this._formBuilder.group({
      sName: ['', [Validators.required]],
      sCollection: ['', [Validators.required]],
      eType: ['Image', [Validators.required]],
      nQuantity: ['', [Validators.required]],
      sNftdescription: ['', [Validators.required]],
      // 'Auction', 'Fixed Sale', 'Unlockable'
      eAuctionType: ['', [Validators.required]],
      nBasePrice: ['', [Validators.required]],
      // TODO multiple
      sCollaborator: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      nCollaboratorPercentage: ['', []],
      sSetRoyaltyPercentage: ['', []],

    });
  }
  // 
  // : any;
  // submitted2: Boolean = false;
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

  onSelectDocumentNFT(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|mp3)$/)) {
        this.file = event.target.files[0];
      }
    }
  }
  onSelectDocumentCollection(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|mp3)$/)) {
        this.nftFile = event.target.files[0];
      }
    }
  }

  onClickSubmitCollection() {
    if (this.nftFile && this.nftFile != undefined) {

      this.spinner.show();
      this.submitted1 = true;
      if (this.createCollectionForm.invalid) {
        this.spinner.hide();
        return;
      } else {

        let res = this.createCollectionForm.value;
        console.log('-------------res', res)
        var fd = new FormData();

        fd.append('sName', res.sName);
        fd.append('sDescription', res.sDescription);
        fd.append('nftFile', this.nftFile);


        this.apiService.createCollection(fd).subscribe((updateData: any) => {
          this.spinner.hide();

          if (updateData && updateData['data']) {
            console.log('---------updateData---------', updateData);
            this.toaster.success(updateData['message'])
            this.onClickRefresh();
          } else {

          }

        }, (err: any) => {
          this.spinner.hide();
          if (err && err['message']) {

          }
        });
      }
    } else {
      this.toaster.warning('Please select image.')
    }


  }



  onClickSubmitCollaborator() {

    this.spinner.show();
    this.submitted2 = true;
    if (this.createCollaboratorForm.invalid) {
      this.spinner.hide();
      return;
    } else {

      let res = this.createCollaboratorForm.value;
      console.log('-------------res', res)
      var fd = {
        'sFullname': res.sFullname,
        'sAddress': res.sAddress,
      }

      this.apiService.createCollaborator(fd).subscribe((updateData: any) => {
        this.spinner.hide();

        if (updateData && updateData['data']) {
          console.log('---------updateData---------', updateData);
          this.toaster.success(updateData['message'])
          this.onClickRefresh();
        } else {

        }

      }, (err: any) => {
        this.spinner.hide();
        if (err && err['message']) {
          console.log('----------------errr',)
          err = err['error'];
          this.toaster.error(err['message'])

        }
      });
    }
  }
  onClickRefresh() {
    window.location.reload();
  }

}
