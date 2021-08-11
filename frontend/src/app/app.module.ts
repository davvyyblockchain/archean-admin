import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreateNFTComponent } from './create-nft/create-nft.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NFTListComponent } from './nft-list/nft-list.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { UsersComponent } from './users/users.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ScriptLoaderService } from './script-loader.service';

@NgModule({
  declarations: [
    AppComponent,
    CreateNFTComponent,
    DashboardComponent,
    NFTListComponent,
    MyProfileComponent,
    NFTDetailComponent,
    UsersComponent,
    HeaderComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      enableHtml: true,
    }),
  ],
  providers: [ScriptLoaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
