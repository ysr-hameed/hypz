const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class HypzClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseURL = options.baseURL || 'http://localhost:5000/api';
    
    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    this.files = new FilesAPI(this.axios);
    this.usage = new UsageAPI(this.axios);
    this.billing = new BillingAPI(this.axios);
  }
}

class FilesAPI {
  constructor(axios) {
    this.axios = axios;
  }

  async upload(options) {
    const { file, filename, isPublic = false, expiresIn, metadata = {} } = options;

    const formData = new FormData();
    
    if (Buffer.isBuffer(file)) {
      formData.append('file', file, filename);
    } else if (typeof file === 'string') {
      // File path
      formData.append('file', fs.createReadStream(file));
    } else {
      formData.append('file', file);
    }

    formData.append('isPublic', isPublic);
    if (expiresIn) formData.append('expiresIn', expiresIn);
    if (Object.keys(metadata).length > 0) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await this.axios.post('/files/upload', formData, {
      headers: formData.getHeaders(),
    });

    return response.data.data;
  }

  async list(options = {}) {
    const { limit = 50, offset = 0 } = options;
    const response = await this.axios.get('/files', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  async get(fileId) {
    const response = await this.axios.get(`/files/${fileId}`);
    return response.data.data;
  }

  async getDownloadUrl(fileId) {
    const response = await this.axios.get(`/files/${fileId}/download`);
    return response.data.data.downloadUrl;
  }

  async download(fileId) {
    const url = await this.getDownloadUrl(fileId);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return response.data;
  }

  async delete(fileId) {
    const response = await this.axios.delete(`/files/${fileId}`);
    return response.data;
  }

  async getStats() {
    const response = await this.axios.get('/files/stats/summary');
    return response.data.data;
  }
}

class UsageAPI {
  constructor(axios) {
    this.axios = axios;
  }

  async getCurrent() {
    const response = await this.axios.get('/usage/current');
    return response.data.data;
  }

  async getHistory(options = {}) {
    const { limit = 12 } = options;
    const response = await this.axios.get('/usage/history', {
      params: { limit },
    });
    return response.data.data;
  }
}

class BillingAPI {
  constructor(axios) {
    this.axios = axios;
  }

  async getPlans() {
    const response = await this.axios.get('/billing/plans');
    return response.data.data;
  }

  async getHistory(options = {}) {
    const { limit = 20, offset = 0 } = options;
    const response = await this.axios.get('/billing/history', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  async getStats() {
    const response = await this.axios.get('/billing/stats');
    return response.data.data;
  }
}

module.exports = HypzClient;
module.exports.Client = HypzClient;
module.exports.default = HypzClient;
