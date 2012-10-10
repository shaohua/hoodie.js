// Generated by CoffeeScript 1.3.3

describe("Hoodie.RemoteStore", function() {
  beforeEach(function() {
    this.hoodie = new Mocks.Hoodie;
    spyOn(this.hoodie, "on");
    spyOn(this.hoodie, "trigger");
    spyOn(this.hoodie, "one");
    spyOn(this.hoodie, "unbind");
    this.requestDefer = this.hoodie.defer();
    spyOn(window, "setTimeout");
    spyOn(this.hoodie.my.account, "db").andReturn('joe$example.com');
    spyOn(this.hoodie.my.store, "destroy").andReturn({
      then: function(cb) {
        return cb('objectFromStore');
      }
    });
    spyOn(this.hoodie.my.store, "save").andReturn({
      then: function(cb) {
        return cb('objectFromStore', false);
      }
    });
    return this.remote = new Hoodie.RemoteStore(this.hoodie);
  });
  describe("constructor(@hoodie, options = {})", function() {
    it("should set @name from options", function() {
      var remote;
      remote = new Hoodie.RemoteStore(this.hoodie, {
        name: 'base/path'
      });
      return expect(remote.name).toBe('base/path');
    });
    it("should set _sync to false by default", function() {
      var remote;
      remote = new Hoodie.RemoteStore(this.hoodie);
      return expect(remote._sync).toBe(false);
    });
    return it("should set _sync to false from pased sync option", function() {
      var remote;
      remote = new Hoodie.RemoteStore(this.hoodie, {
        sync: true
      });
      return expect(remote._sync).toBe(true);
    });
  });
  describe("#find(type, id)", function() {
    beforeEach(function() {
      return spyOn(this.remote, "request").andReturn("request_promise");
    });
    return it("should return the request promise", function() {
      return expect(this.remote.find("todo", "1")).toBe('request_promise');
    });
  });
  describe("#findAll(type)", function() {
    beforeEach(function() {
      return spyOn(this.remote, "request").andReturn(this.requestDefer.promise());
    });
    it("should return a promise", function() {
      return expect(this.remote.findAll()).toBePromise();
    });
    _when("type is not set", function() {
      return it("should send a GET to /_all_docs", function() {
        this.remote.findAll();
        return expect(this.remote.request).wasCalledWith("GET", "/_all_docs");
      });
    });
    _when("type is todo", function() {
      return it('should send a GET to /_all_docs?startkey="todo/"&endkey="todo0"', function() {
        this.remote.findAll('todo');
        return expect(this.remote.request).wasCalledWith("GET", '/_all_docs?startkey="todo/"&endkey="todo0"');
      });
    });
    _when("request success", function() {
      beforeEach(function() {
        return this.requestDefer.resolve({
          rows: "rows_array"
        });
      });
      return it("should be resolved with array of objects", function() {
        var promise;
        promise = this.remote.findAll();
        return expect(promise).toBeResolvedWith("rows_array");
      });
    });
    return _when("request has an error", function() {
      beforeEach(function() {
        return this.requestDefer.reject("error");
      });
      return it("should be rejected with the response error", function() {
        var promise;
        promise = this.remote.findAll();
        return expect(promise).toBeRejectedWith("error");
      });
    });
  });
  describe("#save(type, id, object)", function() {
    beforeEach(function() {
      spyOn(this.remote, "uuid").andReturn("uuid567");
      return spyOn(this.remote, "request").andReturn("request_promise");
    });
    it("should generate an id if it is undefined", function() {
      this.remote.save("car", void 0, {});
      return expect(this.remote.uuid).wasCalled();
    });
    it("should not generate an id if id is set", function() {
      this.remote.save("car", 123, {});
      return expect(this.remote.uuid).wasNotCalled();
    });
    it("should return promise by @request", function() {
      return expect(this.remote.save("car", 123, {})).toBe('request_promise');
    });
    return _when("saving car/123 with color: red", function() {
      beforeEach(function() {
        var _ref, _ref1;
        this.remote.save("car", 123, {
          color: "red"
        });
        return _ref = this.remote.request.mostRecentCall.args, this.type = _ref[0], this.path = _ref[1], (_ref1 = _ref[2], this.data = _ref1.data), _ref;
      });
      it("should send a PUT request to `/car%2F123`", function() {
        expect(this.type).toBe('PUT');
        return expect(this.path).toBe('/car%2F123');
      });
      it("should add type to saved object", function() {
        return expect(this.data.$type).toBe('car');
      });
      return it("should set _id to `car/123`", function() {
        return expect(this.data._id).toBe('car/123');
      });
    });
  });
  describe("#destroy(type, id)", function() {
    beforeEach(function() {
      return spyOn(this.remote, "update").andReturn("update_promise");
    });
    it("should proxy to update with _deleted: true", function() {
      this.remote.destroy('car', 123);
      return expect(this.remote.update).wasCalledWith('car', 123, {
        _deleted: true
      });
    });
    return it("should return promise of update", function() {
      return expect(this.remote.destroy('car', 123)).toBe('update_promise');
    });
  });
  describe("#destroyAll(type)", function() {
    beforeEach(function() {
      return spyOn(this.remote, "updateAll").andReturn("updateAll_promise");
    });
    it("should proxy to updateAll with _deleted: true", function() {
      this.remote.destroyAll('car');
      return expect(this.remote.updateAll).wasCalledWith('car', {
        _deleted: true
      });
    });
    return it("should return promise of updateAll", function() {
      return expect(this.remote.destroyAll('car')).toBe('updateAll_promise');
    });
  });
  describe("#request(type, path, options)", function() {
    beforeEach(function() {
      return spyOn(this.hoodie, "request");
    });
    it("should proxy to hoodie.request", function() {
      this.remote.request("GET", "/something");
      return expect(this.hoodie.request).wasCalled();
    });
    it("should set options.contentType to 'application/json'", function() {
      this.remote.request("GET", "/something");
      return expect(this.hoodie.request).wasCalledWith("GET", "/something", {
        contentType: 'application/json'
      });
    });
    it("should prefix path with @name (encoded)", function() {
      var path, type, _ref;
      this.remote.name = "my/store";
      this.remote.request("GET", "/something");
      _ref = this.hoodie.request.mostRecentCall.args, type = _ref[0], path = _ref[1];
      return expect(path).toBe('/my%2Fstore/something');
    });
    return _when("type is POST", function() {
      beforeEach(function() {
        var path, type, _ref;
        this.remote.request("POST", "/something");
        return _ref = this.hoodie.request.mostRecentCall.args, type = _ref[0], path = _ref[1], this.options = _ref[2], _ref;
      });
      it("should default options.dataType to 'json'", function() {
        return expect(this.options.dataType).toBe('json');
      });
      return it("should default options.dataType to 'json'", function() {
        return expect(this.options.processData).toBe(false);
      });
    });
  });
  describe("get(view, params)", function() {});
  describe("post(view, params)", function() {});
  describe("#connect()", function() {
    beforeEach(function() {
      return spyOn(this.remote, "sync");
    });
    it("should set connected to true", function() {
      this.remote.connected = false;
      this.remote.connect();
      return expect(this.remote.connected).toBe(true);
    });
    return it("should sync", function() {
      this.remote.connect();
      return expect(this.remote.sync).wasCalled();
    });
  });
  describe("#disconnect()", function() {
    it("should abort the pull request", function() {
      this.remote._pullRequest = {
        abort: jasmine.createSpy('pull')
      };
      this.remote.disconnect();
      return expect(this.remote._pullRequest.abort).wasCalled();
    });
    it("should abort the push request", function() {
      this.remote._pushRequest = {
        abort: jasmine.createSpy('push')
      };
      this.remote.disconnect();
      return expect(this.remote._pushRequest.abort).wasCalled();
    });
    return it("should unsubscribe from stores's dirty idle event", function() {
      this.remote.disconnect();
      return expect(this.hoodie.unbind).wasCalledWith('store:idle', this.remote.push);
    });
  });
  describe("#isContinuouslyPulling()", function() {
    _when("remote._sync is false", function() {
      return it("should return false", function() {
        this.remote._sync = false;
        return expect(this.remote.isContinuouslyPulling()).toBe(false);
      });
    });
    _when("remote._sync is true", function() {
      return it("should return true", function() {
        this.remote._sync = true;
        return expect(this.remote.isContinuouslyPulling()).toBe(true);
      });
    });
    _when("remote._sync is pull: true", function() {
      return it("should return true", function() {
        this.remote._sync = {
          pull: true
        };
        return expect(this.remote.isContinuouslyPulling()).toBe(true);
      });
    });
    return _when("remote._sync is push: true", function() {
      return it("should return false", function() {
        this.remote._sync = {
          push: true
        };
        return expect(this.remote.isContinuouslyPulling()).toBe(false);
      });
    });
  });
  describe("#isContinuouslyPushing()", function() {
    _when("remote._sync is false", function() {
      return it("should return false", function() {
        this.remote._sync = false;
        return expect(this.remote.isContinuouslyPushing()).toBe(false);
      });
    });
    _when("remote._sync is true", function() {
      return it("should return true", function() {
        this.remote._sync = true;
        return expect(this.remote.isContinuouslyPushing()).toBe(true);
      });
    });
    _when("remote._sync is pull: true", function() {
      return it("should return false", function() {
        this.remote._sync = {
          pull: true
        };
        return expect(this.remote.isContinuouslyPushing()).toBe(false);
      });
    });
    return _when("remote._sync is push: true", function() {
      return it("should return true", function() {
        this.remote._sync = {
          push: true
        };
        return expect(this.remote.isContinuouslyPushing()).toBe(true);
      });
    });
  });
  describe("#isContinuouslySyncing()", function() {
    _when("remote._sync is false", function() {
      return it("should return false", function() {
        this.remote._sync = false;
        return expect(this.remote.isContinuouslySyncing()).toBe(false);
      });
    });
    _when("remote._sync is true", function() {
      return it("should return true", function() {
        this.remote._sync = true;
        return expect(this.remote.isContinuouslySyncing()).toBe(true);
      });
    });
    _when("remote._sync is pull: true", function() {
      return it("should return false", function() {
        this.remote._sync = {
          pull: true
        };
        return expect(this.remote.isContinuouslySyncing()).toBe(false);
      });
    });
    return _when("remote._sync is push: true", function() {
      return it("should return false", function() {
        this.remote._sync = {
          push: true
        };
        return expect(this.remote.isContinuouslySyncing()).toBe(false);
      });
    });
  });
  describe("#getSinceNr()", function() {
    _when("since not set before", function() {
      return it("should return 0", function() {
        expect(this.remote._since).toBe(void 0);
        return expect(this.remote.getSinceNr()).toBe(0);
      });
    });
    return _when("since set to 100 before", function() {
      beforeEach(function() {
        return this.remote.setSinceNr(100);
      });
      return it("should return 100", function() {
        return expect(this.remote.getSinceNr()).toBe(100);
      });
    });
  });
  describe("#setSinceNr(since)", function() {
    return it("should set _since property", function() {
      expect(this.remote._since).toBe(void 0);
      this.remote.setSinceNr(100);
      return expect(this.remote._since).toBe(100);
    });
  });
  describe("#pull()", function() {
    beforeEach(function() {
      this.remote.connected = true;
      return spyOn(this.remote, "request").andReturn(this.requestDefer.promise());
    });
    _when(".isContinuouslyPulling() is true", function() {
      beforeEach(function() {
        return spyOn(this.remote, "isContinuouslyPulling").andReturn(true);
      });
      it("should send a longpoll GET request to the _changes feed", function() {
        var method, path, _ref;
        this.remote.pull();
        expect(this.remote.request).wasCalled();
        _ref = this.remote.request.mostRecentCall.args, method = _ref[0], path = _ref[1];
        expect(method).toBe('GET');
        return expect(path).toBe('/_changes?include_docs=true&since=0&heartbeat=10000&feed=longpoll');
      });
      return it("should set a timeout to restart the pull request", function() {
        this.remote.pull();
        return expect(window.setTimeout).wasCalledWith(this.remote._restartPullRequest, 25000);
      });
    });
    _when(".isContinuouslyPulling() is false", function() {
      beforeEach(function() {
        return spyOn(this.remote, "isContinuouslyPulling").andReturn(false);
      });
      return it("should send a normal GET request to the _changes feed", function() {
        var method, path, _ref;
        this.remote.pull();
        expect(this.remote.request).wasCalled();
        _ref = this.remote.request.mostRecentCall.args, method = _ref[0], path = _ref[1];
        expect(method).toBe('GET');
        return expect(path).toBe('/_changes?include_docs=true&since=0');
      });
    });
    _when("request is successful / returns changes", function() {
      beforeEach(function() {
        var _this = this;
        return this.remote.request.andReturn({
          then: function(success) {
            _this.remote.request.andReturn({
              then: function() {}
            });
            return success(Mocks.changesResponse());
          }
        });
      });
      it("should remove `todo/abc3` from store", function() {
        this.remote.pull();
        return expect(this.hoodie.my.store.destroy).wasCalledWith('todo', 'abc3', {
          remote: true
        });
      });
      it("should save `todo/abc2` in store", function() {
        this.remote.pull();
        return expect(this.hoodie.my.store.save).wasCalledWith('todo', 'abc2', {
          _rev: '1-123',
          content: 'remember the milk',
          done: false,
          order: 1,
          $type: 'todo',
          id: 'abc2'
        }, {
          remote: true
        });
      });
      it("should trigger remote events", function() {
        spyOn(this.remote, "trigger");
        this.remote.pull();
        expect(this.remote.trigger).wasCalledWith('destroy', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('destroy:todo', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('destroy:todo:abc3', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('change', 'destroy', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('change:todo', 'destroy', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('change:todo:abc3', 'destroy', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('update', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('update:todo', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('update:todo:abc2', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('change', 'update', 'objectFromStore');
        expect(this.remote.trigger).wasCalledWith('change:todo', 'update', 'objectFromStore');
        return expect(this.remote.trigger).wasCalledWith('change:todo:abc2', 'update', 'objectFromStore');
      });
      return _and(".isContinuouslyPulling() returns true", function() {
        beforeEach(function() {
          spyOn(this.remote, "isContinuouslyPulling").andReturn(true);
          return spyOn(this.remote, "pull").andCallThrough();
        });
        return it("should pull again", function() {
          this.remote.pull();
          return expect(this.remote.pull.callCount).toBe(2);
        });
      });
    });
    _when("request errors with 403 unauthorzied", function() {
      beforeEach(function() {
        var _this = this;
        this.remote.request.andReturn({
          then: function(success, error) {
            _this.remote.request.andReturn({
              then: function() {}
            });
            return error({
              status: 403
            }, 'error object');
          }
        });
        return spyOn(this.remote, "disconnect");
      });
      it("should disconnect", function() {
        this.remote.pull();
        return expect(this.remote.disconnect).wasCalled();
      });
      it("should trigger an unauthenticated error", function() {
        spyOn(this.remote, "trigger");
        this.remote.pull();
        return expect(this.remote.trigger).wasCalledWith('error:unauthenticated', 'error object');
      });
      _and("remote is pullContinuously", function() {
        return beforeEach(function() {
          return this.remote.pullContinuously = true;
        });
      });
      return _and("remote isn't pullContinuously", function() {
        return beforeEach(function() {
          return this.remote.pullContinuously = false;
        });
      });
    });
    _when("request errors with 404 not found", function() {
      beforeEach(function() {
        var _this = this;
        return this.remote.request.andReturn({
          then: function(success, error) {
            _this.remote.request.andReturn({
              then: function() {}
            });
            return error({
              status: 404
            }, 'error object');
          }
        });
      });
      return it("should try again in 3 seconds (it migh be due to a sign up, the userDB might be created yet)", function() {
        this.remote.pull();
        return expect(window.setTimeout).wasCalledWith(this.remote.pull, 3000);
      });
    });
    _when("request errors with 500 oooops", function() {
      beforeEach(function() {
        var _this = this;
        return this.remote.request.andReturn({
          then: function(success, error) {
            _this.remote.request.andReturn({
              then: function() {}
            });
            return error({
              status: 500
            }, 'error object');
          }
        });
      });
      it("should try again in 3 seconds (and hope it was only a hiccup ...)", function() {
        this.remote.pull();
        return expect(window.setTimeout).wasCalledWith(this.remote.pull, 3000);
      });
      return it("should trigger a server error event", function() {
        spyOn(this.remote, "trigger");
        this.remote.pull();
        return expect(this.remote.trigger).wasCalledWith('error:server', 'error object');
      });
    });
    _when("request was aborted manually", function() {
      beforeEach(function() {
        var _this = this;
        return this.remote.request.andReturn({
          then: function(success, error) {
            _this.remote.request.andReturn({
              then: function() {}
            });
            return error({
              statusText: 'abort'
            }, 'error object');
          }
        });
      });
      return it("should try again when .isContinuouslyPulling() returns true", function() {
        spyOn(this.remote, "pull").andCallThrough();
        spyOn(this.remote, "isContinuouslyPulling").andReturn(true);
        this.remote.pull();
        expect(this.remote.pull.callCount).toBe(2);
        this.remote.pull.reset();
        this.remote.isContinuouslyPulling.andReturn(false);
        this.remote.pull();
        return expect(this.remote.pull.callCount).toBe(1);
      });
    });
    return _when("there is a different error", function() {
      beforeEach(function() {
        var _this = this;
        return this.remote.request.andReturn({
          then: function(success, error) {
            _this.remote.request.andReturn({
              then: function() {}
            });
            return error({}, 'error object');
          }
        });
      });
      return it("should try again in 3 seconds if .isContinuouslyPulling() returns false", function() {
        spyOn(this.remote, "isContinuouslyPulling").andReturn(true);
        this.remote.pull();
        expect(window.setTimeout).wasCalledWith(this.remote.pull, 3000);
        window.setTimeout.reset();
        this.remote.isContinuouslyPulling.andReturn(false);
        this.remote.pull();
        return expect(window.setTimeout).wasNotCalledWith(this.remote.pull, 3000);
      });
    });
  });
  describe("#push(docs)", function() {
    beforeEach(function() {
      spyOn(Date, "now").andReturn(10);
      this.remote._timezoneOffset = 1;
      return spyOn(this.remote, "request").andReturn(this.requestDefer.promise());
    });
    _when("no docs passed", function() {
      return it("shouldn't do anything", function() {
        this.remote.push();
        this.remote.push([]);
        return expect(this.remote.request).wasNotCalled();
      });
    });
    _when("Array of docs passed", function() {
      beforeEach(function() {
        this.todoObjects = [
          {
            type: 'todo',
            id: '1'
          }, {
            type: 'todo',
            id: '2'
          }, {
            type: 'todo',
            id: '3'
          }
        ];
        return this.remote.push(this.todoObjects);
      });
      return it("should POST the passed objects", function() {
        var data;
        expect(this.remote.request).wasCalled();
        data = this.remote.request.mostRecentCall.args[2].data;
        return expect(data.docs.length).toBe(3);
      });
    });
    return _and("one deleted and one new doc passed", function() {
      beforeEach(function() {
        var _ref;
        this.remote.push(Mocks.changedDocs());
        expect(this.remote.request).wasCalled();
        return _ref = this.remote.request.mostRecentCall.args, this.method = _ref[0], this.path = _ref[1], this.options = _ref[2], _ref;
      });
      it("should post the changes to the user's db _bulk_docs API", function() {
        expect(this.method).toBe('POST');
        return expect(this.path).toBe('/_bulk_docs');
      });
      it("should send the docs in appropriate format", function() {
        var doc, docs;
        docs = this.options.data.docs;
        doc = docs[0];
        expect(doc.id).toBeUndefined();
        expect(doc._id).toBe('todo/abc3');
        return expect(doc._localInfo).toBeUndefined();
      });
      it("should set data.new_edits to false", function() {
        var new_edits;
        new_edits = this.options.data.new_edits;
        return expect(new_edits).toBe(false);
      });
      return it("should set new _revision ids", function() {
        var deletedDoc, docs, newDoc;
        docs = this.options.data.docs;
        deletedDoc = docs[0], newDoc = docs[1];
        expect(deletedDoc._rev).toBe('3-uuid');
        expect(newDoc._rev).toMatch('1-uuid');
        expect(deletedDoc._revisions.start).toBe(3);
        expect(deletedDoc._revisions.ids[0]).toBe('uuid');
        expect(deletedDoc._revisions.ids[1]).toBe('123');
        expect(newDoc._revisions.start).toBe(1);
        return expect(newDoc._revisions.ids[0]).toBe('uuid');
      });
    });
  });
  describe("#sync(docs)", function() {
    beforeEach(function() {
      spyOn(this.remote, "push").andCallFake(function(docs) {
        return {
          pipe: function(cb) {
            return cb(docs);
          }
        };
      });
      return spyOn(this.remote, "pull");
    });
    it("should push changes and pass arguments", function() {
      this.remote.sync([1, 2, 3]);
      return expect(this.remote.push).wasCalledWith([1, 2, 3]);
    });
    it("should pull changes and pass arguments", function() {
      this.remote.sync([1, 2, 3]);
      return expect(this.remote.pull).wasCalledWith([1, 2, 3]);
    });
    return _when(".isContinuouslyPushing() returns true", function() {
      beforeEach(function() {
        return spyOn(this.remote, "isContinuouslyPushing").andReturn(true);
      });
      it("should bind to store:idle event", function() {
        this.remote.sync();
        return expect(this.hoodie.on).wasCalledWith('store:idle', this.remote.push);
      });
      return it("should unbind from store:idle event before it binds to it", function() {
        var order;
        order = [];
        this.hoodie.unbind.andCallFake(function(event) {
          return order.push("unbind " + event);
        });
        this.hoodie.on.andCallFake(function(event) {
          return order.push("bind " + event);
        });
        this.remote.sync();
        expect(order[0]).toBe('unbind store:idle');
        return expect(order[1]).toBe('bind store:idle');
      });
    });
  });
  describe("#on(event, callback)", function() {
    it("should namespace events with `name`", function() {
      var cb;
      cb = jasmine.createSpy('test');
      this.remote.name = 'databaseName';
      this.remote.on('funky', cb);
      return expect(this.hoodie.on).wasCalledWith('databaseName:funky', cb);
    });
    return it("should namespace multiple events correctly", function() {
      var cb;
      cb = jasmine.createSpy('test');
      this.remote.name = 'databaseName';
      this.remote.on('super funky fresh', cb);
      return expect(this.hoodie.on).wasCalledWith('databaseName:super databaseName:funky databaseName:fresh', cb);
    });
  });
  return describe("#trigger(event, parameters...)", function() {
    return it("should namespace events with `name`", function() {
      var cb;
      cb = jasmine.createSpy('test');
      this.remote.name = 'databaseName';
      this.remote.trigger('funky', cb);
      return expect(this.hoodie.trigger).wasCalledWith('databaseName:funky', cb);
    });
  });
});
