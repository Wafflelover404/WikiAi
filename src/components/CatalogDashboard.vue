<template>
  <div class="catalog-dashboard-container">
    <div class="dashboard-header">
      <div>
        <h1>📊 Catalog Analytics Dashboard</h1>
        <p class="subtitle">Monitor your OpenCart catalog performance and indexing status</p>
      </div>
      <button @click="refreshDashboard" class="btn btn-primary refresh-btn">
        🔄 Refresh
      </button>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">📦</div>
        <div class="metric-content">
          <p class="metric-label">Total Catalogs</p>
          <p class="metric-value">{{ totalCatalogs }}</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📄</div>
        <div class="metric-content">
          <p class="metric-label">Total Products</p>
          <p class="metric-value">{{ totalProducts }}</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">✨</div>
        <div class="metric-content">
          <p class="metric-label">Indexed Products</p>
          <p class="metric-value">{{ totalIndexed }}</p>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📈</div>
        <div class="metric-content">
          <p class="metric-label">Indexing Progress</p>
          <p class="metric-value">{{ indexingProgress }}%</p>
        </div>
      </div>
    </div>

    <!-- Catalogs List -->
    <div class="catalogs-section">
      <h2>Your Catalogs</h2>

      <div v-if="catalogs.length === 0" class="empty-catalogs">
        <svg class="empty-icon" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
        </svg>
        <h3>No Catalogs Yet</h3>
        <p>Start by creating a catalog or importing products from your OpenCart store.</p>
        <router-link to="/app/plugins" class="btn btn-primary">
          Go to Plugin Manager
        </router-link>
      </div>

      <div v-else class="catalogs-list">
        <div v-for="catalog in catalogs" :key="catalog.catalog_id" class="catalog-detailed-card">
          <div class="card-header">
            <div>
              <h3>{{ catalog.shop_name }}</h3>
              <p class="shop-url" v-if="catalog.shop_url">
                🔗 {{ catalog.shop_url }}
              </p>
            </div>
            <div class="card-actions">
              <button @click="showCatalogDetails(catalog.catalog_id)" class="btn-icon" title="View details">
                ℹ️
              </button>
              <button @click="downloadCatalogReport(catalog.catalog_id)" class="btn-icon" title="Download report">
                ⬇️
              </button>
            </div>
          </div>

          <div class="card-description">
            {{ catalog.description || 'No description provided' }}
          </div>

          <!-- Detailed Stats -->
          <div class="card-stats-detailed">
            <div class="stat-row">
              <span class="stat-label">Total Products:</span>
              <span class="stat-value">{{ catalog.total_products }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Indexed Products:</span>
              <span class="stat-value">{{ catalog.indexed_products }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Pending Indexing:</span>
              <span class="stat-value">{{ catalog.total_products - catalog.indexed_products }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Last Updated:</span>
              <span class="stat-value">{{ formatDate(catalog.updated_at) }}</span>
            </div>
            <div class="stat-row" v-if="catalog.last_indexed_at">
              <span class="stat-label">Last Indexed:</span>
              <span class="stat-value">{{ formatDate(catalog.last_indexed_at) }}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-section">
            <div class="progress-header">
              <span>Indexing Progress</span>
              <span class="progress-percentage">{{ Math.round((catalog.indexed_products / catalog.total_products) * 100 || 0) }}%</span>
            </div>
            <div class="progress-bar-container">
              <div 
                class="progress-bar-fill"
                :style="{ width: `${Math.round((catalog.indexed_products / catalog.total_products) * 100 || 0)}%` }"
              ></div>
            </div>
          </div>

          <!-- Search Bar for Catalog -->
          <div class="search-section">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search products in this catalog..."
              class="search-input"
              @keyup.enter="searchCatalog(catalog.catalog_id)"
            />
            <button 
              @click="searchCatalog(catalog.catalog_id)"
              class="btn btn-secondary"
            >
              Search
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="card-actions-bottom">
            <button 
              @click="indexCatalogProducts(catalog.catalog_id)"
              :disabled="catalog.indexed_products === catalog.total_products"
              class="btn btn-primary"
            >
              {{ catalog.indexed_products === catalog.total_products ? '✓ All Indexed' : 'Index Now' }}
            </button>
            <button 
              @click="viewProducts(catalog.catalog_id)"
              class="btn btn-secondary"
            >
              View Products
            </button>
            <button 
              @click="showDeleteConfirm(catalog.catalog_id)"
              class="btn btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results Modal -->
    <div v-if="showSearchResults" class="modal-overlay" @click="showSearchResults = false">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>Search Results</h3>
          <button @click="showSearchResults = false" class="btn-close">✕</button>
        </div>

        <div v-if="searchResults.length === 0" class="empty-results">
          <p>No products matched your search.</p>
        </div>

        <div v-else class="search-results-list">
          <div v-for="result in searchResults" :key="result.product_id" class="result-item">
            <h4>{{ result.name }}</h4>
            <p class="result-sku">SKU: {{ result.sku || 'N/A' }}</p>
            <p class="result-price">${{ parseFloat(result.price).toFixed(2) }}</p>
            <p class="result-description">{{ result.description?.substring(0, 200) }}...</p>
            <div class="result-meta">
              <span v-if="result.indexed" class="badge indexed">Indexed ✓</span>
              <span v-else class="badge pending">Pending</span>
              <span v-if="result.status === 1" class="badge active">Active</span>
              <span v-else class="badge inactive">Inactive</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showSearchResults = false" class="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Products Modal -->
    <div v-if="showProductsModal" class="modal-overlay" @click="showProductsModal = false">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedCatalogName }} - Products</h3>
          <button @click="showProductsModal = false" class="btn-close">✕</button>
        </div>

        <div v-if="catalogProducts.length === 0" class="empty-products">
          <p>No products in this catalog.</p>
        </div>

        <div v-else class="products-table-container">
          <table class="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Status</th>
                <th>Indexed</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in catalogProducts.slice(0, 25)" :key="product.product_id">
                <td>{{ product.name }}</td>
                <td>{{ product.sku || '-' }}</td>
                <td>${{ parseFloat(product.price).toFixed(2) }}</td>
                <td>
                  <span :class="['badge', product.status === 1 ? 'active' : 'inactive']">
                    {{ product.status === 1 ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <span v-if="product.indexed" class="badge indexed">✓</span>
                  <span v-else class="badge pending">−</span>
                </td>
                <td>{{ product.quantity }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="catalogProducts.length > 25" class="more-products">
            Showing 25 of {{ catalogProducts.length }} products
          </p>
        </div>

        <div class="modal-footer">
          <button @click="showProductsModal = false" class="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <h3>Delete Catalog?</h3>
        <p>This action cannot be undone. All products in this catalog will be deleted.</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="btn btn-danger">
            Yes, Delete
          </button>
          <button @click="showDeleteModal = false" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CatalogDashboard',
  setup() {
    const catalogs = ref([])
    const isLoading = ref(false)
    const showSearchResults = ref(false)
    const showProductsModal = ref(false)
    const showDeleteModal = ref(false)
    const searchQuery = ref('')
    const searchResults = ref([])
    const catalogProducts = ref([])
    const selectedCatalogId = ref(null)
    const selectedCatalogName = ref('')
    const catalogToDelete = ref(null)
    const notification = ref(null)

    const totalCatalogs = computed(() => catalogs.value.length)
    const totalProducts = computed(() => 
      catalogs.value.reduce((sum, cat) => sum + cat.total_products, 0)
    )
    const totalIndexed = computed(() =>
      catalogs.value.reduce((sum, cat) => sum + cat.indexed_products, 0)
    )
    const indexingProgress = computed(() =>
      totalProducts.value > 0 
        ? Math.round((totalIndexed.value / totalProducts.value) * 100)
        : 0
    )

    const formatDate = (dateString) => {
      if (!dateString) return 'Never'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    const showNotification = (message, type = 'success') => {
      notification.value = { message, type }
      setTimeout(() => {
        notification.value = null
      }, 3000)
    }

    const loadCatalogs = async () => {
      isLoading.value = true
      try {
        const response = await fetch('/catalogs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          catalogs.value = data.response.catalogs || []
        } else {
          showNotification('Failed to load catalogs', 'error')
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      } finally {
        isLoading.value = false
      }
    }

    const refreshDashboard = async () => {
      await loadCatalogs()
      showNotification('Dashboard refreshed')
    }

    const indexCatalogProducts = async (catalogId) => {
      try {
        isLoading.value = true
        const response = await fetch(`/catalogs/${catalogId}/index`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          showNotification('Catalog indexing started!')
          await loadCatalogs()
        } else {
          showNotification('Failed to index catalog', 'error')
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      } finally {
        isLoading.value = false
      }
    }

    const viewProducts = async (catalogId) => {
      try {
        selectedCatalogId.value = catalogId
        const catalog = catalogs.value.find(c => c.catalog_id === catalogId)
        selectedCatalogName.value = catalog?.shop_name || 'Catalog'

        const response = await fetch(`/catalogs/${catalogId}/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          catalogProducts.value = data.response.products || []
          showProductsModal.value = true
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      }
    }

    const searchCatalog = async (catalogId) => {
      if (!searchQuery.value.trim()) {
        showNotification('Please enter a search query', 'info')
        return
      }

      try {
        const response = await fetch(
          `/catalogs/${catalogId}/search?query=${encodeURIComponent(searchQuery.value)}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          searchResults.value = data.response.results || []
          showSearchResults.value = true
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      }
    }

    const showDeleteConfirm = (catalogId) => {
      catalogToDelete.value = catalogId
      showDeleteModal.value = true
    }

    const confirmDelete = async () => {
      try {
        const response = await fetch(`/catalogs/${catalogToDelete.value}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          showNotification('Catalog deleted')
          showDeleteModal.value = false
          await loadCatalogs()
        } else {
          showNotification('Failed to delete catalog', 'error')
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      }
    }

    const downloadCatalogReport = (catalogId) => {
      const catalog = catalogs.value.find(c => c.catalog_id === catalogId)
      if (!catalog) return

      const report = `
Catalog Report: ${catalog.shop_name}
Generated: ${new Date().toLocaleString()}

Shop URL: ${catalog.shop_url || 'N/A'}
Total Products: ${catalog.total_products}
Indexed Products: ${catalog.indexed_products}
Pending: ${catalog.total_products - catalog.indexed_products}
Progress: ${Math.round((catalog.indexed_products / catalog.total_products) * 100 || 0)}%

Last Updated: ${formatDate(catalog.updated_at)}
Last Indexed: ${formatDate(catalog.last_indexed_at) || 'Never'}
      `

      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report))
      element.setAttribute('download', `catalog-${catalogId}.txt`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)

      showNotification('Report downloaded')
    }

    const showCatalogDetails = (catalogId) => {
      const catalog = catalogs.value.find(c => c.catalog_id === catalogId)
      if (catalog) {
        alert(`
Catalog: ${catalog.shop_name}
ID: ${catalogId}
URL: ${catalog.shop_url || 'N/A'}
Description: ${catalog.description || 'N/A'}
Total Products: ${catalog.total_products}
Indexed: ${catalog.indexed_products}
Active: ${catalog.is_active ? 'Yes' : 'No'}
Created: ${formatDate(catalog.created_at)}
        `)
      }
    }

    // Load catalogs on mount
    loadCatalogs()

    return {
      catalogs,
      isLoading,
      totalCatalogs,
      totalProducts,
      totalIndexed,
      indexingProgress,
      showSearchResults,
      showProductsModal,
      showDeleteModal,
      searchQuery,
      searchResults,
      catalogProducts,
      selectedCatalogName,
      notification,
      formatDate,
      refreshDashboard,
      indexCatalogProducts,
      viewProducts,
      searchCatalog,
      showDeleteConfirm,
      confirmDelete,
      downloadCatalogReport,
      showCatalogDetails
    }
  }
}
</script>

<style scoped>
.catalog-dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 32px;
}

.subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 15px;
}

.refresh-btn {
  white-space: nowrap;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  font-size: 40px;
}

.metric-content {
  flex: 1;
}

.metric-label {
  margin: 0;
  color: #7f8c8d;
  font-size: 13px;
  text-transform: uppercase;
  font-weight: 500;
}

.metric-value {
  margin: 5px 0 0 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
}

/* Catalogs Section */
.catalogs-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.catalogs-section h2 {
  margin: 0 0 25px 0;
  color: #2c3e50;
  font-size: 24px;
}

.empty-catalogs {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  fill: #bdc3c7;
  margin: 0 auto 20px;
}

.empty-catalogs h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.empty-catalogs p {
  color: #7f8c8d;
  margin: 0 0 20px 0;
}

.catalogs-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.catalog-detailed-card {
  background: #f8f9fa;
  border: 1px solid #ecf0f1;
  border-radius: 10px;
  padding: 25px;
  transition: all 0.3s ease;
}

.catalog-detailed-card:hover {
  border-color: #e74c3c;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.shop-url {
  margin: 5px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  transform: scale(1.2);
}

.card-description {
  color: #7f8c8d;
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 14px;
}

.card-stats-detailed {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #7f8c8d;
  font-size: 13px;
  font-weight: 500;
}

.stat-value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

.progress-percentage {
  color: #e74c3c;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c 0%, #f39c12 100%);
  transition: width 0.3s ease;
}

.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.card-actions-bottom {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.card-actions-bottom .btn {
  flex: 1;
  min-width: 120px;
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background: #e74c3c;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background: #d5dbdb;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 25px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.modal-content.large {
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #95a5a6;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close:hover {
  color: #2c3e50;
  transform: scale(1.1);
}

.modal-content h3 {
  margin: 0 0 15px 0;
}

.modal-content p {
  color: #7f8c8d;
  margin: 10px 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions .btn {
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.modal-footer .btn {
  min-width: 120px;
}

/* Search Results */
.empty-results {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.result-item {
  background: #f8f9fa;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 15px;
}

.result-item h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.result-sku,
.result-price {
  margin: 4px 0;
  color: #7f8c8d;
  font-size: 13px;
  font-weight: 500;
}

.result-description {
  margin: 8px 0;
  color: #555;
  font-size: 14px;
  line-height: 1.4;
}

.result-meta {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.indexed {
  background: #d1ecf1;
  color: #0c5460;
}

.badge.pending {
  background: #fff3cd;
  color: #856404;
}

.badge.active {
  background: #d4edda;
  color: #155724;
}

.badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

/* Products Table */
.products-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.products-table thead {
  background: #f8f9fa;
}

.products-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
}

.products-table td {
  padding: 12px;
  border-bottom: 1px solid #ecf0f1;
  color: #555;
}

.products-table tbody tr:hover {
  background: #f8f9fa;
}

.empty-products {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.more-products {
  padding: 15px;
  text-align: center;
  color: #7f8c8d;
  font-size: 13px;
  border-top: 1px solid #ecf0f1;
}

/* Notifications */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: slideInRight 0.3s ease;
  z-index: 1100;
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification.success {
  background: #27ae60;
}

.notification.error {
  background: #e74c3c;
}

.notification.info {
  background: #3498db;
}

/* Responsive Design */
@media (max-width: 768px) {
  .opencart-plugins-container {
    padding: 15px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .card-stats-detailed {
    grid-template-columns: 1fr;
  }

  .card-actions-bottom {
    flex-direction: column;
  }

  .card-actions-bottom .btn {
    width: 100%;
  }

  .search-section {
    flex-direction: column;
  }

  .modal-content.large {
    max-width: 95%;
  }
}
</style>
