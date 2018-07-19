import { Component, Input, OnInit } from '@angular/core';
import { Connector } from '../../../connector.service';
import { ApiService } from '../../../api.service';
import * as _ from 'lodash';
import { LuxService } from '../lux.service';
import { ModalService } from '../../modal.service';
import {EventService} from '../../../event.service';
import {CardService} from '../../card.service';

@Component({
  selector: 'app-lux-viz',
  templateUrl: './lux-viz.component.html',
  styleUrls: ['./lux-viz.component.less']
})
export class LuxVizComponent implements OnInit {
  @Input() readerId;

  certData;
  pinpad: boolean;
  needCan: boolean = true;
  readingData: boolean = false;
  canCode: string;
  pincode;
  pinStatus;
  validationArray;
  biometricData;
  signatureObject;
  picData;
  pic;
  signature;
  pinCounterUser: number;
  pinCounterAdmin: number; //PUK counter

  authCert;
  nonRepCert;
  rootCerts;
  loadingCerts;

  constructor(private API: ApiService, private Connector: Connector,
              private lux: LuxService, private modalService: ModalService,
              private eventService: EventService, private cardService: CardService,) {
    this.eventService.pinCheckHandled$.subscribe((results) => this.handlePinCheckResult(results))
  }

  ngOnInit() {
    this.pinStatus = 'idle';
    const comp = this;
    // check type of reader
    comp.Connector.core('reader', [comp.readerId]).then(res => {
      this.pinpad = res.data.pinpad;
      if (!this.pinpad) {
        comp.pincode = { value: '' };
      } else {
        // launch data request
        comp.getAllData()
      }
    });
  }

  checkPin() {
    this.modalService.openPinModalForReader(this.readerId);
  }

  handlePinCheckResult(pinCheck) {
    this.pinStatus = this.cardService.determinePinModalResult(pinCheck, 'luxeid');
  }

  resetPin() {
    this.modalService.openResetPinModalForReader(this.readerId, 'Reset pin', this.canCode);
  }

  unblockPin() {
    this.modalService.openUnblockPinModalForReader(this.readerId, 'Unblock pin' , this.canCode);
  }

  changePin() {
    this.modalService.openChangePinModalForReader(this.readerId, 'Change pin',this.canCode);
  }

  submitCan(canCode) {
    this.readingData = true;
    this.needCan = false;
    this.canCode = canCode;

    this.getAllData();
    this.getPinTryCounter();
  }

  downloadSummary() {
    this.modalService.openSummaryModalForReader(this.readerId, true, this.lux);
  }

  toggleCerts() {
    this.certData = !this.certData;
  }

  getPinTryCounter() {
    this.Connector.plugin('luxeid', 'pinTryCounter',[this.readerId, this.canCode],[{"pin_reference" : 'user'}]).then(res => {
          this.pinCounterUser = res.data;
    }, error => {
      console.error(error);
    })
    this.Connector.plugin('luxeid', 'pinTryCounter',[this.readerId, this.canCode],[{"pin_reference" : 'admin'}]).then(res => {
      this.pinCounterAdmin = res.data;
    }, error => {
      console.error(error);
    })
  }

  getAllData() {
    const comp = this;
    comp.Connector.plugin('luxeid', 'allData', [comp.readerId, comp.canCode]).then(res => {
      this.readingData = false;

      comp.biometricData = res.data.biometric;
      comp.signatureObject = res.data.signature_object;
      comp.picData = res.data.picture;

      const conversions = [];

      conversions.push(comp.API.convertJPEG2000toJPEG(comp.picData.image));

      if (!_.isEmpty(res.data.signature_image) && !_.isEmpty(res.data.signature_image.image)) {
        conversions.push(comp.API.convertJPEG2000toJPEG(res.data.signature_image.image));
      }

      Promise.all(conversions).then(converted => {
        comp.pic = converted[0].data.base64Pic;
        if (!_.isEmpty(converted[1])) { comp.signature = converted[1].data.base64Pic; }
      });

      comp.authCert = res.data.authentication_certificate.base64;
      comp.nonRepCert = res.data.non_repudiation_certificate.base64;
      comp.rootCerts = _.map(res.data.root_certificates, 'base64');

      comp.readingData = false;

      const validationReq1 = {
        certificateChain: [
          { order: 0, certificate: res.data.authentication_certificate.base64 },
          { order: 1, certificate: res.data.root_certificates[1].base64 },
          { order: 2, certificate: res.data.root_certificates[0].base64 },
        ]
      };
      const validationReq2 = {
        certificateChain: [
          { order: 0, certificate: res.data.non_repudiation_certificate.base64 },
          { order: 1, certificate: res.data.root_certificates[1].base64 },
          { order: 2, certificate: res.data.root_certificates[0].base64 },
        ]
      };
      comp.validationArray = [ comp.Connector.ocv('validateCertificateChain', [validationReq1]),
        comp.Connector.ocv('validateCertificateChain', [validationReq2]) ];
    });
  }
}
