import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateNFTComponent } from './create-nft/create-nft.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { NFTListComponent } from './nft-list/nft-list.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  { path: "", component: DashboardComponent },
  { path: "create-NFT", component: CreateNFTComponent },
  { path: "my-profile", component: MyProfileComponent },
  { path: "NFT-detail", component: NFTDetailComponent },
  { path: "NFT-marketplace", component: NFTListComponent },
  { path: "users", component: UsersComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
