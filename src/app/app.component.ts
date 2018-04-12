import { Component, OnInit } from '@angular/core';
import {Connector} from './connector.service';
import * as _ from 'lodash';
import {EventService} from './event.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'app';
  gclAvailable: boolean;
  gclChecked: boolean;
  readers: any;
  cardPresent: boolean;
  isFirefox: boolean;
  pollingReaders: boolean;
  pollingCard: boolean;
  adminPanelOpen: boolean;
  cardTypesOpen: boolean;
  faqOpen: boolean;
  error: boolean;
  pollTimeout: boolean;
  dlLink: string;
  readerWithCard: boolean;

  connector;

  private pollIterations = 0;

  constructor(private Connector: Connector, private eventService: EventService) {
    this.eventService.adminPanelOpened$.subscribe(() => this.onAdminPanelOpened());
    this.eventService.faqOpened$.subscribe(() => this.onFaqOpened());
    this.eventService.gclInstalled$.subscribe(() => this.onGclInstalled());
    this.eventService.readerSelected$.subscribe(item => this.onReaderSelected(item));
    this.eventService.retryCard$.subscribe(() => this.onRetryCard());
    this.eventService.retryReader$.subscribe(() => this.onRetryReader());
    this.eventService.sidebarOpened$.subscribe(() => this.onSidebarOpened());
    this.eventService.startOver$.subscribe(() => this.onStartOver());
  }

  ngOnInit() {
    this.Connector.isGCLAvailable().then(available => {
      this.gclChecked = true;
      this.gclAvailable = available;
      this.Connector.getConnector().then(client => {
        this.connector = client;

        if (this.gclAvailable) {
          this.connector.core().version().then(version => {
            console.log('Using T1C-JS ' + version);
          });
          this.connector.core().info().then(info => {
            console.log('GCL version installed: ' + info.data.version);
          });
        } else { console.log('No GCL installation found'); }


        // Determine initial action we need to take
        if (!this.cardPresent) {
          // No card is present, check if we have readers

          if (_.isEmpty(this.readers)) {
            // No readers present, do we have GCL?
            if (!this.gclAvailable) {
              // No GCL is available, prompt user to download
              this.promptDownload();
            } else {
              // GCL is present, poll for readers being connected
              this.pollForReaders();
            }
          } else {
            // Reader(s) are present, poll for card
            this.pollForCard();
          }
        } else {
          // A card is present, determine type and read its data
          this.readCard();
        }
      });
    });

    this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  }

  dismissPanels() {
    this.eventService.closeSidebar();
    this.eventService.closeAdminPanel();
    this.cardTypesOpen = false;
    this.faqOpen = false;
  }

  refreshAdminData() {
    this.eventService.refreshAdminData();
  }

  // Event handlers
  onReaderSelected(item) {
    this.readerWithCard = item;
  }

  onGclInstalled() {
    const controller = this;
    // Analytics.trackEvent('T1C', 'install', 'Trust1Connector installed');
    this.Connector.initialize().then((client) => {
      controller.connector = client;
      controller.gclAvailable = true;
      this.pollForReaders();
    });
  }

  onSidebarOpened() {
    // Make sure the FAQ panel is closed when opening sidebar
    if (!this.cardTypesOpen) {
      this.faqOpen = false;
      this.eventService.closeAdminPanel();
      this.adminPanelOpen = false;
    }
    this.cardTypesOpen = !this.cardTypesOpen;
  }

  onAdminPanelOpened() {
    if (!this.adminPanelOpen) {
      this.faqOpen = false;
      this.eventService.closeSidebar();
      this.cardTypesOpen = false;

    }
    this.adminPanelOpen = !this.adminPanelOpen;
  }

  onFaqOpened() {
    // Make sure the side panel is closed when opening FAQ
    if (!this.faqOpen) {
      this.eventService.closeSidebar();
      this.eventService.closeAdminPanel();
      this.cardTypesOpen = false;
      this.adminPanelOpen = false;

    }
    this.faqOpen = !this.faqOpen;
  }

  onStartOver() {
    const controller = this;
    this.connector.core().readers().then(result => {
      controller.readers = result.data;
      if (_.find(result.data, function (reader) {
        return _.has(reader, 'card');
      })) {
        controller.readCard();
      } else {
        controller.readers = result.data;
        controller.readerWithCard = undefined;
        controller.cardPresent = false;
        if (_.isEmpty(controller.readers)) {
          controller.pollForReaders();
        } else {
          controller.pollForCard();
        }
      }
    }, function () {
      controller.readers = [];
      controller.readerWithCard = undefined;
      controller.cardPresent = false;
      controller.pollForReaders();
    });
  }

  onRetryReader() {
    this.readerWithCard = undefined;
    this.cardPresent = false;
    this.pollForReaders();
  }

  onRetryCard() {
    this.readers = [];
    this.readerWithCard = undefined;
    this.cardPresent = false;
    this.pollForCard();
  }


  pollForReaders() {
    const controller = this;
    if (!this.pollingReaders) { this.pollingReaders = true; }
    this.error = false;
    this.connector.core().pollReaders(30, function (err, result) {
      // Success callback
      // Found at least one reader, poll for cards
      if (err) {
        controller.error = true;
      } else {
        controller.readers = result.data;
        controller.pollingReaders = false;
        // Analytics.trackEvent('reader', 'connect', 'Reader connected: ' + _.join(_.map(controller.readers, 'name'), ','));
        controller.pollForCard();
      }
    }, function () {
      // Not used
    }, function () {
      // timeout, poll again
      controller.pollForReaders();
    });
  }

  pollForCard() {
    const controller = this;
    if (!controller.pollingCard) { controller.pollingCard = true; }
    controller.error = false;
    this.connector.core().pollCardInserted(3, function (err, result) {
      // Success callback
      // controller.readers = result.data;
      if (err) {
        controller.error = true;
      } else {
        controller.pollingCard = false;
        controller.pollTimeout = false;
        // Analytics.trackEvent('card', 'insert', 'Card inserted: ' + result.card.atr);
        controller.pollIterations = 0;
        // Found a card, attempt to read it
        // Refresh reader list first
        controller.connector.core().readers().then(readerResult => {
          controller.readers = readerResult.data;
          controller.readCard();
        }, function () {
          controller.pollForCard();
        });
      }
    }, function () {
      // "Waiting for reader connection" callback
    }, function () {
      // "Waiting for card" callback
    }, function () {
      // timeout
      controller.pollIterations++;
      // if enough time has passed, show the card not recognized message
      if (controller.pollIterations >= 5) { controller.pollTimeout = true; }
      // RMC.checkReaderRemoval().then(function (removed) {
      //   if (removed) { controller.pollingCard = false; }
      //   else { controller.pollForCard(); }
      // });
    });
  }

  promptDownload() {
    // Prompt for dl
    const controller = this;
    this.connector.download().then(res => {
      controller.dlLink = res.url;
    });
  }

  readCard() {
    this.readerWithCard = _.find(this.readers, function (o) {
      return _.has(o, 'card');
    });
  }
}
