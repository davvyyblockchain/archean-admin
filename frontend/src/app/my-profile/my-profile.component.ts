import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';
import { ScriptLoaderService } from '../script-loader.service';

// {_id: "61129d701bf84242a9127486", sTransactionStatus: 1, sName: "Artist NFT",…}
// eType: "Image"
// nBasePrice: {$numberDecimal: "0.5"}
// nQuantity: 10
// nTokenID: 22
// oCurrentOwner: "610feeee1bf84242a9127425"
// oUser: [{_id: "610feeee1bf84242a9127425", sUserName: "devXHHH", sRole: "user",…}]
// sHash: "QmWv7u6CHKKea17DDZfaBfPLkMep5vg4qxFntKLCTfj5y7"
// sName: "Artist NFT"
// sTransactionStatus: 1
// _id: "61129d701bf84242a9127486"

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  editProfileform: any;

  submitted1: Boolean = false;
  file: any;
  profileData:any;
  constructor(
    private _formBuilder: FormBuilder,
    private _script: ScriptLoaderService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _route: ActivatedRoute,
    private toaster: ToastrService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.buildCreateForm1();
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

    this._script.loadScripts("app-my-profile", scripts).then(function () {

    })
    if (localStorage.getItem('Authorization') && localStorage.getItem('Authorization') != null) {

      this.apiService.getprofile().subscribe((res: any) => {

        if (res && res['data']) {
          this.profileData = res['data'];
          this.profileData.sProfilePicUrl = this.profileData.sProfilePicUrl== undefined ? 'assets/img/avatars/avatar5.jpg' : 'https://ipfs.io/ipfs/' + this.profileData.sProfilePicUrl;


          this.profileData.sFirstname = this.profileData && this.profileData.oName &&  this.profileData.oName.sFirstname ? this.profileData.oName.sFirstname : '';
          this.profileData.sLastname = this.profileData && this.profileData.oName &&  this.profileData.oName.sLastname ? this.profileData.oName.sLastname : '';

          this.editProfileform.patchValue( this.profileData);
        }

      }, (err: any) => {
        console.log('-----err--------', err)

      });

    }else{
      this.router.navigate([''])

    }
  }

  buildCreateForm1() {

    this.editProfileform = this._formBuilder.group({
      sWalletAddress: ['', [Validators.required, Validators.pattern('^0x[a-fA-F0-9]{40}$')]],
      sLastname: ['', [Validators.required]],
      sUserName: ['', [Validators.required]],
      sFirstname: ['', [Validators.required]],
      // userProfile: ['', [Validators.required]],
      sBio: ['', [Validators.required]],
      sWebsite: ['', [Validators.required]],
      sEmail: ['', [Validators.required]],
    });
  }

  onClickTab(type: any) {
    if (type == 'profile') {

    }
  }

  onSelectDocument(event: any) {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].name.match(/\.(jpeg|jpg|png|)$/)) {
        this.file = event.target.files[0];
      }
    }
  }

  onClickSubmit() {
    this.spinner.show();
    this.submitted1 = true;
    if (this.editProfileform.invalid) {
      this.spinner.hide();
      return;
    } else {

      let res = this.editProfileform.value;
      console.log('-------------res',res)
      var fd = new FormData();

      fd.append('sFirstname', res.sFirstname);
      fd.append('sLastname', res.sLastname);
      fd.append('sUserName', res.sUserName);
      fd.append('sWalletAddress', res.sWalletAddress);
      fd.append('sBio', res.sBio);
      fd.append('sWebsite', res.sWebsite);
      fd.append('sEmail', res.sEmail);

      if (this.file && this.file != undefined) {
        fd.append('userProfile', this.file);

      }
      this.apiService.updateProfile(fd).subscribe((updateData: any) => {
        this.spinner.hide();

        if (updateData && updateData['data']) {
          this.onClickRefresh();
        } else {

        }

      }, (err: any) => {
        this.spinner.hide();
        if (err && err['message']) {

        }
      });
    }


  }
  onClickRefresh() {
    window.location.reload();
  }
}