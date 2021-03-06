import {Component, OnInit} from '@angular/core';
import {Connector} from '../connector.service';
import {EventService} from '../event.service';

@Component({
  selector: 'app-file-exchange-typeops',
  templateUrl: './file-exchange-typeops.component.html',
  styleUrls: ['./file-exchange-typeops.component.less']
})
export class FileExchangeTypeopsComponent implements OnInit {
  // create Type properties
  showModal: boolean;
  createdType;

  // check Type exists properties
  typeExists: boolean;
  existingEntity: string;
  existingType: string;

  // create Type and dirs properties
  dirShowModal: boolean;
  dirCreatedType;

  // create dirs
  dirRecursive: boolean;
  dirRecursiveCreated;

  constructor(private Connector: Connector, private eventService: EventService) {
    this.eventService.fileExchangePanelOpened$.subscribe(() => this.getData());
    this.eventService.refreshFileExchangeData$.subscribe(() => this.getData());
  }

  ngOnInit() {
    this.showModal = true; // default
    this.typeExists = false;
    this.dirShowModal = true; // default
    this.dirRecursive = true; //default
  }

  getData() {
  }

  createType(entity, type, abspath) {
    const inputEntity = entity.value;
    const inputType = type.value;
    const inputInitAbsPath = abspath.value;
    // console.log('path resulst:' + this.cleanArray(inputInitAbsPath.split('/')));
    this.Connector.plugin('filex', 'createType', [],
      [inputEntity, inputType, this.cleanArray(inputInitAbsPath.split('/')), this.showModal]).then(res => {
      this.createdType = res.data;
      this.eventService.refreshFileExcchangeData();
    });
  }

  createTypeDirs(entity, type, relpath) {
    const inputEntity = entity.value;
    const inputType = type.value;
    const inputRelPath = relpath.value;
    this.Connector.plugin('filex', 'createTypeDirs', [],
      [inputEntity, inputType, this.cleanArray(inputRelPath.split('/')), this.dirShowModal]).then(res => {
      this.dirCreatedType = res.data;
      this.eventService.refreshFileExcchangeData();
    });
  }

  createDirs(entity, type, relpath) {
    const inputEntity = entity.value;
    const inputType = type.value;
    const inputRelPath = relpath.value;
    this.Connector.plugin('filex', 'createDir', [],
      [inputEntity, inputType, this.cleanArray(inputRelPath.split('/')), this.dirRecursive]).then(res => {
      this.dirRecursiveCreated = res.data;
      this.eventService.refreshFileExcchangeData();
    });
  }

  existsType(entity, type) {
    this.existingEntity = entity.value;
    this.existingType = type.value;
    this.Connector.plugin('filex', 'existsType', [],
      [this.existingEntity, this.existingType]).then(res => {
      this.typeExists = res.data;
    });
  }

  // Will remove all falsy values: undefined, null, 0, false, NaN and "" (empty string)
  cleanArray(actual) {
    const newArr = new Array();
    for (let i = 0; i < actual.length; i++) {
      if (actual[i]) {
        newArr.push(actual[i]);
      }
    }
    return newArr;
  }
}
