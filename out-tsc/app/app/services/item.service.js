var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
var ItemService = /** @class */ (function () {
    function ItemService() {
        this.items = [
            {
                'id': "1",
                'title': "Example 1",
                'description': 'description 1'
            },
            {
                'id': "2",
                'title': "Example 2",
                'description': 'description 2'
            },
            {
                'id': "3",
                'title': "Example 3",
                'description': 'description 3'
            },
            {
                'id': "4",
                'title': "Example 4",
                'description': 'description 4'
            },
            {
                'id': "5",
                'title': "Need a more complex app?",
                'description': 'Check the Ionic 4 Full Starter App.'
            }
        ];
    }
    ItemService.prototype.createItem = function (title, description) {
        var randomId = Math.random().toString(36).substr(2, 5);
        this.items.push({
            'id': randomId,
            'title': title,
            'description': description
        });
    };
    ItemService.prototype.getItems = function () {
        return this.items;
    };
    ItemService.prototype.getItemById = function (id) {
        return this.items.filter(function (item) { return item.id === id; });
    };
    ItemService.prototype.updateItem = function (newValues) {
        var itemIndex = this.items.findIndex(function (item) { return item.id == newValues.id; });
        this.items[itemIndex] = newValues;
    };
    ItemService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [])
    ], ItemService);
    return ItemService;
}());
export { ItemService };
//# sourceMappingURL=item.service.js.map