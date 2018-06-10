import { Component, OnInit } from '@angular/core';
import {Connector} from '../connector.service';
import {EventService} from '../event.service';

@Component({
  selector: 'app-file-exchange-types',
  templateUrl: './file-exchange-types.component.html',
  styleUrls: ['./file-exchange-types.component.less']
})
export class FileExchangeTypesComponent implements OnInit {
  entities;
  files;
  totalFiles;
  selectedEntity;

  constructor(private Connector: Connector, private eventService: EventService) {
    this.eventService.fileExchangePanelOpened$.subscribe(() => this.getData());
    this.eventService.refreshFileExchangeData$.subscribe(() => this.getData());
  }

  ngOnInit() {}

  getData() {
    this.Connector.plugin('filex', 'listTypes', [], []).then(res => {
        this.entities = res.data;
      });
  }

  getFilesForType(entity) {
    this.Connector.plugin('filex', 'listTypeContent', [], [entity.entity, entity.type]).then(res => {
      this.files = res.data.files;
      this.totalFiles = res.data.total;
      this.selectedEntity = entity;
    });
  }

  getTypeInfo(entity) {
    this.Connector.plugin('filex', 'listType', [], [entity.entity, entity.type]).then(res => {
      this.selectedEntity = res.data;
    });
  }

  resetTypeInfo(entity) {
    this.selectedEntity = undefined;
  }

  deleteTypeMapping(entity) {
    this.Connector.plugin('filex', 'deleteType', [], [entity.entity, entity.type]).then( res => {
        this.files = undefined;
        this.totalFiles = 0;
        this.eventService.refreshFileExcchangeData();
      });
  }

  updateTypeMapping(entity) {
    this.Connector.plugin('filex', 'updateType', [], [entity.entity, entity.type, 30]).then( res => {
      this.files = undefined;
      this.totalFiles = 0;
      this.eventService.refreshFileExcchangeData();
    });
  }

  uploadFile(file) {
    console.log('upload file: ' + file.name);
  }
}