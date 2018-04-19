import {EventEmitter, Injectable} from '@angular/core';

export class Event {
  constructor(public name: string) {}
}

export class ReaderIdEvent {
  constructor(public id?: string) {}
}
export class ReaderEvent {
  constructor(public data: any) {}
}

export class ConsentEvent {
  constructor(public data: boolean, public success: boolean) {}
}

export class PinCheckEvent {
  constructor(public result: any, public error: boolean, public cancelled: boolean) {}
}

export class ChallengeEvent {
  constructor(public result: any, public error: boolean, public cancelled: boolean) {}
}

@Injectable()
export class EventService {
  public adminPanelClosed$: EventEmitter<Event>;
  public adminPanelOpened$: EventEmitter<Event>;
  public consentError$: EventEmitter<Event>;
  public consentRequired$: EventEmitter<Event>;
  public consentResult$: EventEmitter<ConsentEvent>;
  public faqClosed$: EventEmitter<Event>;
  public faqOpened$: EventEmitter<Event>;
  public gclInstalled$: EventEmitter<Event>;
  public networkError$: EventEmitter<Event>;
  public addressPinCheckHandled$: EventEmitter<PinCheckEvent>;
  public challengeHandled$: EventEmitter<ChallengeEvent>;
  public pinCheckHandled$: EventEmitter<PinCheckEvent>;
  public readerSelected$: EventEmitter<ReaderEvent>;
  public readersWithCards$: EventEmitter<ReaderEvent>;
  public refreshAdminData$: EventEmitter<Event>;
  public reinitialize$: EventEmitter<Event>;
  public retryCard$: EventEmitter<Event>;
  public retryReader$: EventEmitter<Event>;
  public sidebarClosed$: EventEmitter<Event>;
  public sidebarOpened$: EventEmitter<Event>;
  public startOver$: EventEmitter<ReaderIdEvent>;

  constructor() {
    this.adminPanelClosed$ = new EventEmitter();
    this.adminPanelOpened$ = new EventEmitter();
    this.consentError$ = new EventEmitter();
    this.consentRequired$ = new EventEmitter();
    this.consentResult$ = new EventEmitter();
    this.faqClosed$ = new EventEmitter();
    this.faqOpened$ = new EventEmitter();
    this.gclInstalled$ = new EventEmitter();
    this.networkError$ = new EventEmitter();
    this.addressPinCheckHandled$ = new EventEmitter<PinCheckEvent>();
    this.challengeHandled$ = new EventEmitter<ChallengeEvent>();
    this.pinCheckHandled$ = new EventEmitter<PinCheckEvent>();
    this.readerSelected$ = new EventEmitter();
    this.readersWithCards$ = new EventEmitter();
    this.refreshAdminData$ = new EventEmitter();
    this.reinitialize$ = new EventEmitter();
    this.retryCard$ = new EventEmitter();
    this.retryReader$ = new EventEmitter();
    this.sidebarClosed$ = new EventEmitter();
    this.sidebarOpened$ = new EventEmitter();
    this.startOver$ = new EventEmitter();
  }

  public addressPinCheckHandled(result: any, error?: boolean, cancelled?: boolean) {
    this.addressPinCheckHandled$.emit(new PinCheckEvent(result, error || false, cancelled || false));
  }

  public challengeHandled(result, error?: boolean, cancelled?: boolean) {
    this.challengeHandled$.emit(new ChallengeEvent(result, error || false, cancelled || false));
  }

  public closeAdminPanel() {
    this.adminPanelClosed$.emit(new Event('admin-panel-close'));
  }

  public closeFaq(): void {
    this.faqClosed$.emit(new Event('faq-close'));
  }

  public closeSidebar(): void {
    this.sidebarClosed$.emit(new Event('sidebar-close'));
  }

  public consentError(): void {
    this.consentError$.emit(new Event('consent-error'));
  }

  public consentRequired(): void {
    this.consentRequired$.emit(new Event('consent-required'));
  }

  public gclInstalled(): void {
    this.gclInstalled$.emit(new Event('GclInstalled'));
  }

  public networkError(): void {
    this.networkError$.emit(new Event('network-error'));
  }

  public openAdminPanel(): void {
    this.adminPanelOpened$.emit(new Event('admin-panel-open'));
  }

  public openFaq(): void {
    this.faqOpened$.emit(new Event('faq-open'));
  }

  public openSidebar(): void {
    this.sidebarOpened$.emit(new Event('sidebar-open'));
  }

  public pinCheckHandled(result: any, error?: boolean, cancelled?: boolean) {
    this.pinCheckHandled$.emit(new PinCheckEvent(result, error || false, cancelled || false));
  }

  public readersWithCards(readers): void {
    this.readersWithCards$.emit(new ReaderEvent(readers.data));
  }

  public refreshAdminData(): void {
    this.refreshAdminData$.emit(new Event('refresh-admin-data'));
  }

  public reinitialize(): void {
    this.reinitialize$.emit(new Event('reinit'));
  }

  public retryCard(): void {
    this.retryCard$.emit(new Event('retry-card'));
  }

  public retryReader(): void {
    this.retryReader$.emit(new Event('retry-reader'));
  }

  public selectReader(reader): void {
    this.readerSelected$.emit(reader);
  }

  public startOver(id?): void {
    this.startOver$.emit(new ReaderIdEvent(id));
  }

}