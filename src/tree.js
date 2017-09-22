class Tree {
  constructor(obj, childNodeName) {
    this.cnt = 1;
    this.obj = obj || { children: [] };
    this.indexes = {};
    this.childNodeName = childNodeName || 'children';
    this.build(this.obj);
  }

  build(obj) {
    const indexes = this.indexes;
    const startId = this.cnt;
    const self = this;

    const index = { id: startId, node: obj };
    indexes[this.cnt + ''] = index;
    this.cnt++;

    if (obj[self.childNodeName] && obj[self.childNodeName].length) {
      walk(obj[self.childNodeName], index);
    }

    function walk(objs, parent) {
      const children = [];
      objs.forEach(function(obj, i) {
        const index = {};
        index.id = self.cnt;
        index.node = obj;

        if (parent) index.parent = parent.id;

        indexes[self.cnt + ''] = index;
        children.push(self.cnt);
        self.cnt++;

        if (obj[self.childNodeName] && obj[self.childNodeName].length)
          walk(obj[self.childNodeName], index);
      });
      parent[self.childNodeName] = children;

      children.forEach(function(id, i) {
        const index = indexes[id + ''];
        if (i > 0) index.prev = children[i - 1];
        if (i < children.length - 1) index.next = children[i + 1];
      });
    }

    return index;
  }

  getIndex(id) {
    const index = this.indexes[id + ''];
    if (index) return index;
  }

  removeIndex(index) {
    const self = this;
    del(index);

    function del(index) {
      delete self.indexes[index.id + ''];
      if (index[self.childNodeName] && index[self.childNodeName].length) {
        index[self.childNodeName].forEach(function(child) {
          del(self.getIndex(child));
        });
      }
    }
  }

  get(id) {
    const index = this.getIndex(id);
    if (index && index.node) return index.node;
    return null;
  }

  remove(id) {
    const index = this.getIndex(id);
    const node = this.get(id);
    const parentIndex = this.getIndex(index.parent);
    const parentNode = this.get(index.parent);
    const self = this;
    parentNode[self.childNodeName].splice(
      parentNode[self.childNodeName].indexOf(node),
      1
    );
    parentIndex[self.childNodeName].splice(
      parentIndex[self.childNodeName].indexOf(id),
      1
    );
    this.removeIndex(index);
    this.updateChildren(parentIndex[self.childNodeName]);

    return node;
  }

  updateChildren(children) {
    children.forEach(
      function(id, i) {
        const index = this.getIndex(id);
        index.prev = index.next = null;
        if (i > 0) index.prev = children[i - 1];
        if (i < children.length - 1) index.next = children[i + 1];
      }.bind(this)
    );
  }

  insert(obj, parentId, i) {
    const parentIndex = this.getIndex(parentId);
    const parentNode = this.get(parentId);
    const self = this;

    const index = this.build(obj);
    index.parent = parentId;

    parentNode[self.childNodeName] = parentNode[self.childNodeName] || [];
    parentIndex[self.childNodeName] = parentIndex[self.childNodeName] || [];

    parentNode[self.childNodeName].splice(i, 0, obj);
    parentIndex[self.childNodeName].splice(i, 0, index.id);

    this.updateChildren(parentIndex[self.childNodeName]);
    if (parentIndex.parent) {
      this.updateChildren(
        this.getIndex(parentIndex.parent)[self.childNodeName]
      );
    }

    return index;
  }

  insertBefore(obj, destId) {
    const destIndex = this.getIndex(destId);
    const parentId = destIndex.parent;
    const self = this;
    const i = this.getIndex(parentId)[self.childNodeName].indexOf(destId);
    return this.insert(obj, parentId, i);
  }

  insertAfter(obj, destId) {
    const destIndex = this.getIndex(destId);
    const parentId = destIndex.parent;
    const self = this;
    const i = this.getIndex(parentId)[self.childNodeName].indexOf(destId);
    return this.insert(obj, parentId, i + 1);
  }

  prepend(obj, destId) {
    return this.insert(obj, destId, 0);
  }

  append(obj, destId) {
    const destIndex = this.getIndex(destId);
    const self = this;
    destIndex[self.childNodeName] = destIndex[self.childNodeName] || [];
    return this.insert(obj, destId, destIndex[self.childNodeName].length);
  }
}

module.exports = Tree;