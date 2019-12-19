import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/Message';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { UserService } from '../_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private alertify: AlertifyService,
    private authservice: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.messages = data['messages'].result;
      this.pagination = data['messages'].pagination;
    });
  }

  loadMessages() {
    this.userService
      .getMessages(
        this.authservice.decodedToken.nameid,
        this.pagination.currentPage,
        this.pagination.itemsPerPage,
        this.messageContainer
      )
      .subscribe(
        (res: PaginatedResult<Message[]>) => {
          this.messages = res.result;
          this.pagination = res.pagination;
        },
        error => {
          this.alertify.error(this.translate.instant('DataProblem'));
        }
      );
  }

  deleteMessage(id: number) {
    this.alertify.confirm(this.translate.instant('MesDelConfirm'), () => {
      this.userService
        .deleteMessage(id, this.authservice.decodedToken.nameid)
        .subscribe(
          () => {
            this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
            this.alertify.success(this.translate.instant('MesDelSuccess'));
          },
          error => {
            this.alertify.error(this.translate.instant('MesDelError'));
          }
        );
    });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }
}
