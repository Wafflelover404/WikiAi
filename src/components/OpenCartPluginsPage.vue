<template>
  <div class="opencart-plugins-container">
    <div class="plugins-header">
      <div class="header-content">
        <h1>
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
          </svg>
          OpenCart Integration
        </h1>
        <p class="subtitle">Integrate your OpenCart shops and sync product catalogs for semantic search</p>
      </div>
      <div v-if="pluginStatus.isEnabled" class="sync-status-badge">
        <span :class="['status-indicator', isSyncing ? 'syncing' : 'idle']"></span>
        {{ isSyncing ? 'Syncing...' : 'Ready' }}
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="plugins-tabs">
      <button 
        :class="['tab-button', { active: activeTab === 'plugins' }]"
        @click="activeTab = 'plugins'"
      >
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
        Plugin Manager
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'catalogs' }]"
        @click="activeTab = 'catalogs'"
      >
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.3-1.54-4 5h12L13.96 9.29z"/>
        </svg>
        Catalogs
      </button>
    </div>

    <!-- Plugin Manager Tab -->
    <div v-if="activeTab === 'plugins'" class="tab-content">
      <div class="plugin-cards-grid">
        <!-- OpenCart Plugin Card -->
        <div class="plugin-card">
          <div class="plugin-header">
            <h3><SvgIcons icon="shopping" /> OpenCart</h3>
            <span :class="['plugin-status', pluginStatus.isEnabled ? 'enabled' : 'disabled']">
              {{ pluginStatus.isEnabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
          
          <p class="plugin-description">
            Enable semantic search by integrating your OpenCart store to sync product catalogs and descriptions.
          </p>

          <div class="plugin-details">
            <p><strong>Version:</strong> {{ pluginStatus.version }}</p>
            <p><strong>Connected Shops:</strong> {{ shops.length }}</p>
          </div>

          <div class="integration-form">
            <h4>Register OpenCart Shop</h4>
            
            <div class="form-group">
              <label>Shop Name</label>
              <input 
                v-model="integrationForm.shopName"
                type="text"
                placeholder="My Store"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Shop URL</label>
              <input 
                v-model="integrationForm.shopUrl"
                type="url"
                placeholder="https://shop.example.com"
                class="form-input"
              />
            </div>

            <div class="button-group">
              <button 
                @click="registerShop"
                :disabled="isLoading"
                class="btn btn-primary"
              >
                <span v-if="!isLoading">+ Register Shop</span>
                <span v-else>Registering...</span>
              </button>
              <button 
                @click="resetForm"
                class="btn btn-secondary"
              >
                Reset
              </button>
            </div>
          </div>

          <!-- Registered Shops Grid -->
          <div v-if="shops.length > 0" class="shops-section">
            <h4>Your Registered Shops</h4>
            <div class="shops-grid">
              <div v-for="shop in shops" :key="shop.shop_id" class="shop-card">
                <div class="shop-header">
                  <h5>{{ shop.shop_name }}</h5>
                  <button 
                    @click="deleteShop(shop.shop_id)"
                    class="btn btn-danger btn-sm"
                    title="Unregister this shop"
                  >
                    ✕
                  </button>
                </div>
                
                <p class="shop-url">{{ shop.shop_url }}</p>
                <p class="shop-date">Registered: {{ formatDate(shop.created_at) }}</p>
                
                <div class="shop-actions">
                  <button 
                    @click="importShopProducts(shop.shop_id)"
                    :disabled="isLoading"
                    class="btn btn-primary"
                  >
                    Import & Index Products
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-shops">
            <p>No shops registered yet. Register one above to get started!</p>
          </div>
        </div>

        <!-- More Plugins Coming Soon -->
        <div class="plugin-card coming-soon">
          <h3><SvgIcons icon="package" /> WooCommerce</h3>
          <span class="badge">Coming Soon</span>
          <p>Sync WordPress WooCommerce stores</p>
        </div>

        <div class="plugin-card coming-soon">
          <h3><SvgIcons icon="gift" /> Shopify</h3>
          <span class="badge">Coming Soon</span>
          <p>Connect your Shopify store</p>
        </div>

        <div class="plugin-card coming-soon">
          <h3><SvgIcons icon="briefcase" /> Magento</h3>
          <span class="badge">Coming Soon</span>
          <p>Integrate with Magento stores</p>
        </div>
      </div>
    </div>

    <!-- Catalogs Tab -->
    <div v-if="activeTab === 'catalogs'" class="tab-content">
      <div v-if="catalogs.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
        </svg>
        <h3>No Catalogs Yet</h3>
        <p>Register a shop and import products to create catalogs</p>
        <button 
          @click="activeTab = 'plugins'"
          class="btn btn-primary"
        >
          Go to Shops
        </button>
      </div>

      <div v-else class="catalogs-section">
        <div class="catalogs-header">
          <h3>Your Catalogs ({{ catalogs.length }})</h3>
          <div class="header-buttons">
            <button 
              @click="activeTab = 'plugins'"
              class="btn btn-secondary"
              title="Import products from a registered shop"
            >
              + Import From Shop
            </button>
            <button 
              @click="syncCatalogs"
              :disabled="isSyncing"
              class="btn btn-primary"
            >
              {{ isSyncing ? 'Syncing...' : 'Sync Catalogs' }}
            </button>
          </div>
        </div>

        <div v-if="catalogs.length === 0" class="empty-catalogs">
          <p>No catalogs imported yet. Import products from your OpenCart store.</p>
        </div>

        <div v-else class="catalogs-grid">
          <div v-for="catalog in catalogs" :key="catalog.catalog_id" class="catalog-card">
            <div class="catalog-header">
              <h4>{{ catalog.shop_name }}</h4>
            </div>

            <p class="catalog-description">{{ catalog.description || 'No description' }}</p>

            <div class="catalog-stats">
              <div class="stat">
                <span class="stat-value">{{ catalog.total_products }}</span>
                <span class="stat-label">Total Products</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ catalog.indexed_products }}</span>
                <span class="stat-label">Indexed</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ Math.round((catalog.indexed_products / catalog.total_products) * 100 || 0) }}%</span>
                <span class="stat-label">Indexed</span>
              </div>
            </div>

            <div class="catalog-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${Math.round((catalog.indexed_products / catalog.total_products) * 100 || 0)}%` }"
                ></div>
              </div>
            </div>

            <div class="catalog-timestamp">
              <p v-if="catalog.last_indexed_at">
                Last indexed: {{ formatDate(catalog.last_indexed_at) }}
              </p>
              <p v-else class="no-index">Not indexed yet</p>
            </div>

            <div class="catalog-actions">
              <button 
                @click="viewCatalogDetails(catalog.catalog_id)"
                class="btn btn-secondary"
              >
                View Products
              </button>
              <button 
                @click="indexCatalog(catalog.catalog_id)"
                :disabled="catalog.indexed_products === catalog.total_products"
                class="btn btn-primary"
              >
                Index Products
              </button>
              <button 
                @click="deleteCatalog(catalog.catalog_id)"
                class="btn btn-danger"
                title="Remove this catalog"
              >
                Remove Catalog
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Catalog Details Modal -->
      <div v-if="showCatalogModal" class="modal-overlay" @click="showCatalogModal = false">
        <div class="modal-content large" @click.stop>
          <div class="modal-header">
            <h3>{{ selectedCatalog?.shop_name }} - Products ({{ catalogProducts.length }})</h3>
            <button @click="showCatalogModal = false" class="btn-close">✕</button>
          </div>

          <div class="modal-toolbar">
            <input 
              v-model="productSearch"
              type="text"
              placeholder="Search products..."
              class="form-input search-input"
            />
            <select v-model="productFilterStatus" class="form-select">
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
            <select v-model="productFilterIndexed" class="form-select">
              <option value="">All Index Status</option>
              <option value="indexed">Indexed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div v-if="filteredCatalogProducts.length === 0" class="empty-products">
            <p>No products match your filters</p>
          </div>

          <div v-else class="products-display">
            <!-- Grid View -->
            <div class="products-grid">
              <div 
                v-for="product in paginatedProducts" 
                :key="product.product_id"
                class="product-card"
              >
                <div v-if="product.image" class="product-image">
                  <img :src="product.image" :alt="product.name" />
                </div>
                <div v-else class="product-image-placeholder">
                  <SvgIcons icon="package" />
                </div>

                <div class="product-info">
                  <h4>{{ product.name }}</h4>
                  <p class="sku">SKU: {{ product.sku || 'N/A' }}</p>
                  
                  <div class="price-section">
                    <span class="price">${{ parseFloat(product.price).toFixed(2) }}</span>
                    <span v-if="product.special_price" class="special-price">
                      ${{ parseFloat(product.special_price).toFixed(2) }}
                    </span>
                  </div>

                  <p class="description">{{ product.description.substring(0, 100) }}...</p>

                  <div class="product-meta">
                    <span :class="['badge', product.status === 1 ? 'active' : 'inactive']">
                      {{ product.status === 1 ? 'Active' : 'Inactive' }}
                    </span>
                    <span :class="['badge', product.indexed ? 'indexed' : 'pending']">
                      {{ product.indexed ? '<SvgIcons icon="checkmark" /> Indexed' : 'Pending Index' }}
                    </span>
                    <span v-if="product.rating" class="badge rating">
                      <SvgIcons icon="search" /> {{ product.rating }}
                    </span>
                  </div>

                  <div class="product-quantity">
                    <span class="quantity-label">Stock:</span>
                    <span :class="['quantity', product.quantity > 0 ? 'in-stock' : 'out-of-stock']">
                      {{ product.quantity }} {{ product.quantity > 0 ? 'in stock' : 'out of stock' }}
                    </span>
                  </div>

                  <a :href="product.url" target="_blank" class="product-url">
                    View in Store →
                  </a>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="btn btn-sm"
              >
                ← Previous
              </button>
              
              <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
              </span>

              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="btn btn-sm"
              >
                Next →
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <div class="footer-stats">
              <span>Total: {{ filteredCatalogProducts.length }} products</span>
              <span>Indexed: {{ filteredCatalogProducts.filter(p => p.indexed).length }}</span>
              <span>Pending: {{ filteredCatalogProducts.filter(p => !p.indexed).length }}</span>
            </div>
            <button @click="showCatalogModal = false" class="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sync Status Tab -->
    <div v-if="activeTab === 'sync'" class="tab-content">
      <div class="sync-status-page">
        <h3>Sync Status Overview</h3>
        
        <div class="sync-summary">
          <div class="summary-card">
            <div class="summary-value">{{ catalogs.length }}</div>
            <div class="summary-label">Connected Catalogs</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">{{ totalProducts }}</div>
            <div class="summary-label">Total Products</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">{{ totalIndexed }}</div>
            <div class="summary-label">Indexed Products</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">{{ syncPercentage }}%</div>
            <div class="summary-label">Overall Progress</div>
          </div>
        </div>

        <div class="sync-detail-section">
          <h4>Catalog Sync Details</h4>
          <div v-if="catalogs.length === 0" class="empty-state">
            <p>No catalogs to sync. Create a catalog first.</p>
          </div>
          <div v-else class="catalog-sync-list">
            <div v-for="catalog in catalogs" :key="catalog.catalog_id" class="catalog-sync-item">
              <div class="sync-info">
                <h5>{{ catalog.shop_name }}</h5>
                <p class="sync-details-text">{{ catalog.total_products }} products | {{ catalog.indexed_products }} indexed</p>
              </div>
              <div class="sync-bar-container">
                <div class="sync-bar">
                  <div 
                    class="sync-fill"
                    :style="{ width: `${Math.round((catalog.indexed_products / catalog.total_products) * 100 || 0)}%` }"
                  ></div>
                </div>
                <span class="sync-percent">{{ Math.round((catalog.indexed_products / catalog.total_products) * 100 || 0) }}%</span>
              </div>
              <button 
                @click="indexCatalog(catalog.catalog_id)"
                :disabled="catalog.indexed_products === catalog.total_products || isSyncing"
                class="btn btn-sm btn-primary"
              >
                {{ catalog.indexed_products === catalog.total_products ? 'Synced' : 'Sync Now' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="pluginStatus.isEnabled" class="sync-actions">
          <button 
            @click="syncAllProducts"
            :disabled="isSyncing || catalogs.length === 0"
            class="btn btn-primary btn-lg"
          >
            {{ isSyncing ? 'Syncing All...' : 'Sync All Catalogs' }}
          </button>
          <button 
            @click="refreshSyncStatus"
            :disabled="isSyncing"
            class="btn btn-secondary"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import SvgIcons from './SvgIcons.vue'

export default {
  name: 'OpenCartPluginsPage',
  components: {
    SvgIcons
  },
  props: {
    token: String,
    serverUrl: String,
    language: String
  },
  setup(props) {
    const activeTab = ref('plugins')
    const isLoading = ref(false)
    const isSyncing = ref(false)
    const showCatalogModal = ref(false)
    const selectedCatalog = ref(null)
    const catalogProducts = ref([])

    const integrationForm = reactive({
      shopName: '',
      shopUrl: ''
    })

    const pluginStatus = reactive({
      isEnabled: true,
      version: '1.0.0'
    })

    const shops = ref([])
    const catalogs = ref([])
    const notification = ref(null)

    // Product search and pagination
    const productSearch = ref('')
    const productFilterStatus = ref('')
    const productFilterIndexed = ref('')
    const currentPage = ref(1)
    const productsPerPage = ref(12)

    const formatDate = (dateString) => {
      if (!dateString) return 'Never'
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }

    const showNotification = (message, type = 'success') => {
      notification.value = { message, type }
      setTimeout(() => {
        notification.value = null
      }, 3000)
    }

    const registerShop = async () => {
      if (!integrationForm.shopName || !integrationForm.shopUrl) {
        showNotification('Please fill in shop name and URL', 'error')
        return
      }

      isLoading.value = true
      try {
        // Register the shop
        const response = await fetch(`${props.serverUrl}/shops/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${props.token}`
          },
          body: JSON.stringify({
            shop_name: integrationForm.shopName,
            shop_url: integrationForm.shopUrl
          })
        })

        if (response.ok) {
          showNotification('Shop registered successfully!')
          resetForm()
          loadShops()
        } else {
          showNotification('Failed to register shop', 'error')
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      } finally {
        isLoading.value = false
      }
    }

    const deleteShop = async (shopId) => {
      if (!confirm('Are you sure you want to unregister this shop?')) return

      try {
        const response = await fetch(`${props.serverUrl}/shops/${shopId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        })

        if (response.ok) {
          showNotification('Shop unregistered')
          loadShops()
        } else {
          showNotification('Failed to delete shop', 'error')
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      }
    }

    const importShopProducts = async (shopId) => {
      isLoading.value = true
      try {
        // Create a catalog from the shop and load products
        const response = await fetch(`${props.serverUrl}/shops/${shopId}/catalogs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          showNotification(`Catalog created! ${data.response.products_loaded} products loaded.`)
          loadCatalogs()
        } else {
          showNotification('Failed to import products', 'error')
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      } finally {
        isLoading.value = false
      }
    }

    const loadShops = async () => {
      try {
        const response = await fetch(`${props.serverUrl}/shops`, {
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          shops.value = data.response.shops || []
        }
      } catch (error) {
        showNotification(`Error loading shops: ${error.message}`, 'error')
      }
    }

    const resetForm = () => {
      integrationForm.shopName = ''
      integrationForm.shopUrl = ''
    }

    const loadCatalogs = async () => {
      try {
        const response = await fetch(`${props.serverUrl}/catalogs`, {
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          catalogs.value = data.response.catalogs || []
          pluginStatus.catalogCount = catalogs.value.length
          
          // If there are any catalogs, enable the plugin status
          if (catalogs.value.length > 0) {
            pluginStatus.isEnabled = true
          }
        }
      } catch (error) {
        showNotification(`Error loading catalogs: ${error.message}`, 'error')
      }
    }

    const syncCatalogs = async () => {
      isSyncing.value = true
      try {
        showNotification('Syncing catalogs...')
        await loadCatalogs()
        showNotification('Catalogs synced successfully!')
      } catch (error) {
        showNotification(`Error syncing: ${error.message}`, 'error')
      } finally {
        isSyncing.value = false
      }
    }

    const indexCatalog = async (catalogId) => {
      try {
        const response = await fetch(`${props.serverUrl}/catalogs/${catalogId}/index`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        })

        if (response.ok) {
          showNotification('Catalog indexing completed!')
          loadCatalogs()
        } else {
          showNotification('Failed to index catalog', 'error')
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      }
    }

    const viewCatalogDetails = async (catalogId) => {
      try {
        const response = await fetch(`${props.serverUrl}/catalogs/${catalogId}/products`, {
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          selectedCatalog.value = catalogs.value.find(c => c.catalog_id === catalogId)
          catalogProducts.value = data.response.products || []
          showCatalogModal.value = true
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      }
    }

    const deleteCatalog = async (catalogId) => {
      if (!confirm('Are you sure you want to delete this catalog?')) return

      try {
        const response = await fetch(`${props.serverUrl}/catalogs/${catalogId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        })

        if (response.ok) {
          showNotification('Catalog deleted')
          loadCatalogs()
        } else {
          showNotification('Failed to delete catalog', 'error')
        }
      } catch (error) {
        showNotification(`Error: ${error.message}`, 'error')
      }
    }

    const goToCatalogsDashboard = () => {
      activeTab.value = 'catalogs'
    }

    // Computed properties for sync status
    const totalProducts = computed(() => {
      return catalogs.value.reduce((sum, c) => sum + (c.total_products || 0), 0)
    })

    const totalIndexed = computed(() => {
      return catalogs.value.reduce((sum, c) => sum + (c.indexed_products || 0), 0)
    })

    const syncPercentage = computed(() => {
      if (totalProducts.value === 0) return 0
      return Math.round((totalIndexed.value / totalProducts.value) * 100)
    })

    const syncStatus = reactive({
      active: false,
      items: []
    })

    // Product filtering and pagination
    const filteredCatalogProducts = computed(() => {
      let filtered = catalogProducts.value

      // Search filter
      if (productSearch.value) {
        const searchLower = productSearch.value.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        )
      }

      // Status filter
      if (productFilterStatus.value) {
        filtered = filtered.filter(p => p.status === parseInt(productFilterStatus.value))
      }

      // Index status filter
      if (productFilterIndexed.value === 'indexed') {
        filtered = filtered.filter(p => p.indexed === true)
      } else if (productFilterIndexed.value === 'pending') {
        filtered = filtered.filter(p => p.indexed === false)
      }

      return filtered
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredCatalogProducts.value.length / productsPerPage.value)
    })

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * productsPerPage.value
      const end = start + productsPerPage.value
      return filteredCatalogProducts.value.slice(start, end)
    })

    // Reset pagination when filters change
    const resetProductPagination = () => {
      currentPage.value = 1
    }

    // Watch for filter changes
    watch([productSearch, productFilterStatus, productFilterIndexed], () => {
      resetProductPagination()
    })

    // Sync all catalogs
    const syncAllProducts = async () => {
      if (catalogs.value.length === 0) {
        showNotification('No catalogs to sync', 'warning')
        return
      }

      isSyncing.value = true
      syncStatus.active = true

      try {
        for (let i = 0; i < catalogs.value.length; i++) {
          const catalog = catalogs.value[i]
          syncStatus.items[i] = {
            catalogName: catalog.shop_name,
            progress: 0
          }

          // Index the catalog
          await indexCatalog(catalog.catalog_id)
          
          syncStatus.items[i].progress = 100
        }

        showNotification('All catalogs synced successfully!')
        await loadCatalogs()
      } catch (error) {
        showNotification(`Sync error: ${error.message}`, 'error')
      } finally {
        isSyncing.value = false
        setTimeout(() => {
          syncStatus.active = false
        }, 2000)
      }
    }

    // Check sync status with backend
    const checkSyncStatus = async () => {
      try {
        const response = await fetch(`${props.serverUrl}/catalogs`, {
          headers: {
            'Authorization': `Bearer ${props.token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.response && data.response.catalogs) {
            catalogs.value = data.response.catalogs
            showNotification('Sync status updated')
          }
        }
      } catch (error) {
        showNotification(`Error checking status: ${error.message}`, 'error')
      }
    }

    // Refresh sync status
    const refreshSyncStatus = async () => {
      await checkSyncStatus()
    }

    // Load catalogs on component mount and when props change
    onMounted(() => {
      if (props.token && props.serverUrl) {
        loadShops()
        loadCatalogs()
      }
    })

    // Watch for prop changes
    watch(() => props.token, (newToken) => {
      if (newToken && props.serverUrl) {
        loadShops()
        loadCatalogs()
      }
    })

    watch(() => props.serverUrl, (newUrl) => {
      if (newUrl && props.token) {
        loadShops()
        loadCatalogs()
      }
    })

    // Reset pagination when filters change
    watch(() => productSearch.value, () => {
      currentPage.value = 1
    })

    watch(() => productFilterStatus.value, () => {
      currentPage.value = 1
    })

    watch(() => productFilterIndexed.value, () => {
      currentPage.value = 1
    })

    return {
      activeTab,
      isLoading,
      isSyncing,
      showCatalogModal,
      selectedCatalog,
      catalogProducts,
      integrationForm,
      pluginStatus,
      catalogs,
      notification,
      syncStatus,
      totalProducts,
      totalIndexed,
      syncPercentage,
      // Product filtering and pagination
      productSearch,
      productFilterStatus,
      productFilterIndexed,
      currentPage,
      productsPerPage,
      filteredCatalogProducts,
      totalPages,
      paginatedProducts,
      formatDate,
      showNotification,
      registerShop,
      deleteShop,
      importShopProducts,
      loadShops,
      resetForm,
      shops,
      loadCatalogs,
      syncCatalogs,
      indexCatalog,
      viewCatalogDetails,
      deleteCatalog,
      syncAllProducts,
      checkSyncStatus,
      refreshSyncStatus
    }
  }
}
</script>
<style scoped>
.opencart-plugins-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  min-height: 100vh;
}

.plugins-header {
  text-align: center;
  margin-bottom: 40px;
  color: var(--color-text-primary);
}

.plugins-header h1 {
  font-size: 32px;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.plugins-header .icon {
  width: 40px;
  height: 40px;
  fill: var(--color-primary);
}

.subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}

.plugins-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--color-border-primary);
}

.tab-button {
  padding: 12px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  bottom: -2px;
}

.tab-button:hover {
  color: var(--color-text-primary);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-button .icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.plugin-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.shops-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid var(--color-border-primary);
}

.shops-section h4 {
  margin: 0 0 20px 0;
  color: var(--color-text-primary);
  font-size: 18px;
}

.shops-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.shop-card {
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-primary);
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s ease;
}

.shop-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-medium);
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.shop-header h5 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 16px;
}

.shop-url {
  color: var(--color-text-secondary);
  font-size: 13px;
  margin: 5px 0;
  word-break: break-all;
}

.shop-date {
  color: var(--color-text-tertiary);
  font-size: 12px;
  margin: 5px 0 15px 0;
}

.shop-actions {
  display: flex;
  gap: 10px;
}

.shop-actions .btn {
  flex: 1;
  font-size: 13px;
  padding: 8px 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border-radius: 8px;
}

.plugin-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 25px;
  box-shadow: var(--color-shadow-medium);
  transition: all 0.3s ease;
}

.plugin-card:hover:not(.coming-soon) {
  box-shadow: var(--color-shadow-dark);
  transform: translateY(-5px);
}

.plugin-card.coming-soon {
  opacity: 0.6;
  pointer-events: none;
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%);
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.plugin-header h3 {
  margin: 0;
  font-size: 20px;
  color: var(--color-text-primary);
}

.plugin-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.plugin-status.enabled {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.plugin-status.disabled {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}

.plugin-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
}

.plugin-details {
  background: var(--color-bg-secondary);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.plugin-details p {
  margin: 8px 0;
  color: var(--color-text-primary);
}

.integration-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-primary);
}

.integration-form h4 {
  margin: 0 0 15px 0;
  color: var(--color-text-primary);
  font-size: 16px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

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
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--color-shadow-medium);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  background: var(--color-bg-hover);
}

.btn-danger {
  background: var(--color-error);
  color: var(--color-text-inverse);
}

.btn-danger:hover {
  background: var(--color-error-dark);
}

.plugin-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.plugin-actions .btn {
  flex: 1;
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.active {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.badge.inactive {
  background: var(--color-error-light);
  color: var(--color-error-dark);
}

.badge.indexed {
  background: var(--color-info-light);
  color: var(--color-info-dark);
}

.badge.pending {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}

/* Catalogs Section */
.catalogs-section {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 25px;
  box-shadow: var(--color-shadow-medium);
}

.catalogs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 15px;
  flex-wrap: wrap;
}

.catalogs-header h3 {
  margin: 0;
  color: var(--color-text-primary);
  flex: 1;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.header-buttons .btn {
  white-space: nowrap;
}

.empty-catalogs {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
}

.catalogs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.catalog-card {
  background: var(--color-bg-secondary);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid var(--color-border-primary);
  transition: all 0.3s ease;
}

.catalog-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-medium);
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.catalog-header h4 {
  margin: 0;
  color: var(--color-text-primary);
  flex: 1;
}

.catalog-header .delete-catalog-btn {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  transform: scale(1.2);
  color: var(--color-error-dark);
}

.catalog-description {
  color: var(--color-text-secondary);
  margin: 0 0 15px 0;
  font-size: 14px;
}

.catalog-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 15px;
}

.stat {
  text-align: center;
  padding: 10px;
  background: var(--color-surface);
  border-radius: 6px;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.catalog-progress {
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--color-bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-warning) 100%);
  transition: width 0.3s ease;
}

.catalog-timestamp {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-bottom: 15px;
}

.no-index {
  color: var(--color-error);
  font-style: italic;
}

.catalog-actions {
  display: flex;
  gap: 10px;
}

.catalog-actions .btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  text-align: center;
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
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

/* Modal Toolbar and Product Filters */
.modal-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-surface);
  cursor: pointer;
  font-size: 14px;
}

/* Product Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.product-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-medium);
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 150px;
  background: var(--color-bg-secondary);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 150px;
  background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: white;
}

.product-info {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-info h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sku {
  font-size: 12px;
  color: #95a5a6;
  margin: 0 0 8px 0;
}

.price-section {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  align-items: center;
}

.price {
  font-size: 16px;
  font-weight: bold;
  color: #27ae60;
}

.special-price {
  font-size: 13px;
  color: #e74c3c;
  text-decoration: line-through;
}

.description {
  font-size: 12px;
  color: #7f8c8d;
  margin: 8px 0;
  line-height: 1.4;
  flex: 1;
}

.product-meta {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.product-meta .badge {
  font-size: 11px;
  padding: 4px 8px;
}

.rating {
  background: #f39c12 !important;
  color: white !important;
}

.product-quantity {
  font-size: 12px;
  margin-bottom: 10px;
  display: flex;
  gap: 5px;
  align-items: center;
}

.quantity-label {
  color: #95a5a6;
  font-weight: 500;
}

.quantity {
  font-weight: bold;
  color: #2c3e50;
}

.quantity.in-stock {
  color: #27ae60;
}

.quantity.out-of-stock {
  color: #e74c3c;
}

.product-url {
  font-size: 12px;
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  padding-top: 8px;
  border-top: 1px solid #ecf0f1;
  transition: color 0.2s;
}

.product-url:hover {
  color: #2980b9;
  text-decoration: underline;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.pagination .btn {
  padding: 8px 16px;
  font-size: 13px;
}

.pagination .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

/* Modal Footer Stats */
.footer-stats {
  display: flex;
  gap: 20px;
  margin-right: auto;
  font-size: 13px;
  color: #7f8c8d;
}

.footer-stats span {
  display: flex;
  align-items: center;
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
  color: #2c3e50;
}

.modal-content p {
  color: #7f8c8d;
  margin: 10px 0;
  line-height: 1.6;
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
}

.modal-footer .btn {
  flex: 1;
}

/* Products Table */
.products-table {
  overflow-x: auto;
  margin-bottom: 20px;
}

.products-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  width: 80px;
  height: 80px;
  fill: #bdc3c7;
  margin: 0 auto 20px;
}

.empty-state h3 {
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.empty-state p {
  color: #7f8c8d;
  margin: 0 0 20px 0;
}

.more-items {
  padding: 15px;
  text-align: center;
  color: #7f8c8d;
  font-size: 13px;
  border-top: 1px solid #ecf0f1;
}

/* Sync Status Styles */
.sync-status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  color: #27ae60;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;
  display: inline-block;
}

.status-indicator.syncing {
  background: #f39c12;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.sync-status-page {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.sync-status-page h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 15px;
}

.sync-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 30px 0;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.summary-value {
  display: block;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.summary-label {
  display: block;
  font-size: 13px;
  opacity: 0.9;
}

.sync-detail-section {
  margin-top: 40px;
}

.sync-detail-section h4 {
  margin-top: 0;
  color: #2c3e50;
}

.catalog-sync-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.catalog-sync-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.sync-info {
  flex: 0 0 200px;
}

.sync-info h5 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.sync-details-text {
  margin: 0;
  font-size: 13px;
  color: #7f8c8d;
}

.sync-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sync-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.sync-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.sync-percent {
  flex: 0 0 40px;
  text-align: right;
  font-weight: 600;
  color: #2c3e50;
}

.sync-actions {
  margin-top: 40px;
  display: flex;
  gap: 10px;
}

.btn-lg {
  padding: 12px 30px;
  font-size: 16px;
}

.sync-status-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
}

.sync-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.sync-card .sync-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sync-card .sync-header h3 {
  margin: 0;
  font-size: 16px;
}

.sync-details {
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.sync-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.sync-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.sync-catalog {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.sync-progress {
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
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

  .plugins-header h1 {
    font-size: 24px;
  }

  .plugin-cards-grid {
    grid-template-columns: 1fr;
  }

  .catalogs-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 95%;
  }

  .catalog-stats {
    grid-template-columns: 1fr;
  }

  .plugins-tabs {
    flex-direction: column;
    gap: 0;
    border-bottom: none;
  }

  .tab-button {
    width: 100%;
    border-bottom: none;
    border-left: 3px solid transparent;
  }

  .tab-button.active {
    border-left-color: var(--color-primary);
    border-bottom: none;
  }
}

/* Dark Theme Styles */
.dark-mode .plugins-container {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: var(--color-text-primary);
}

.dark-mode .plugins-header {
  color: var(--color-text-primary);
}

.dark-mode .subtitle {
  color: var(--color-text-secondary);
}

.dark-mode .tab-button {
  color: var(--color-text-secondary);
  border-bottom-color: var(--color-border-secondary);
}

.dark-mode .tab-button:hover {
  color: var(--color-text-primary);
}

.dark-mode .tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.dark-mode .shops-section h4 {
  color: var(--color-text-primary);
}

.dark-mode .shop-card {
  background: var(--color-surface-variant);
  border-color: var(--color-border-primary);
}

.dark-mode .shop-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-dark);
}

.dark-mode .shop-header h5 {
  color: var(--color-text-primary);
}

.dark-mode .shop-url {
  color: var(--color-text-secondary);
}

.dark-mode .shop-date {
  color: var(--color-text-tertiary);
}

.dark-mode .empty-shops {
  color: var(--color-text-secondary);
  background: var(--color-surface-variant);
}

.dark-mode .plugin-card {
  background: var(--color-surface);
  border-color: var(--color-border-primary);
}

.dark-mode .plugin-card.coming-soon {
  background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
}

.dark-mode .plugin-header h3 {
  color: var(--color-text-primary);
}

.dark-mode .plugin-status.enabled {
  background: var(--color-success-light);
  color: var(--color-success);
}

.dark-mode .plugin-status.disabled {
  background: var(--color-error-light);
  color: var(--color-error);
}

.dark-mode .plugin-description {
  color: var(--color-text-secondary);
}

.dark-mode .plugin-details {
  background: var(--color-surface-variant);
}

.dark-mode .plugin-details p {
  color: var(--color-text-primary);
}

.dark-mode .integration-form h4 {
  color: var(--color-text-primary);
}

.dark-mode .form-label {
  color: var(--color-text-primary);
}

.dark-mode .form-input,
.dark-mode .form-textarea,
.dark-mode .form-select {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
}

.dark-mode .form-input:focus,
.dark-mode .form-textarea:focus,
.dark-mode .form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.dark-mode .btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.dark-mode .btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.dark-mode .btn-secondary {
  background: var(--color-surface-variant);
  color: var(--color-text-primary);
}

.dark-mode .btn-secondary:hover {
  background: var(--color-bg-hover);
}

.dark-mode .btn-danger {
  background: var(--color-error);
  color: var(--color-text-inverse);
}

.dark-mode .btn-danger:hover {
  background: #c0392b;
}

.dark-mode .badge.active {
  background: var(--color-success-light);
  color: var(--color-success);
}

.dark-mode .badge.inactive {
  background: var(--color-error-light);
  color: var(--color-error);
}

.dark-mode .badge.indexed {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.dark-mode .badge.pending {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.dark-mode .catalogs-header h3 {
  color: var(--color-text-primary);
}

.dark-mode .empty-catalogs {
  color: var(--color-text-secondary);
}

.dark-mode .catalog-card {
  background: var(--color-surface-variant);
  border-color: var(--color-border-primary);
}

.dark-mode .catalog-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-dark);
}

.dark-mode .catalog-header h4 {
  color: var(--color-text-primary);
}

.dark-mode .btn-delete {
  color: var(--color-error);
}

.dark-mode .btn-delete:hover {
  color: #c0392b;
}

.dark-mode .catalog-description {
  color: var(--color-text-secondary);
}

.dark-mode .stat-number {
  color: var(--color-primary);
}

.dark-mode .stat-label {
  color: var(--color-text-tertiary);
}

.dark-mode .progress-bar {
  background: var(--color-surface-variant);
}

.dark-mode .progress-fill {
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-warning) 100%);
}

.dark-mode .catalog-timestamp {
  color: var(--color-text-tertiary);
}

.dark-mode .no-index {
  color: var(--color-error);
}

.dark-mode .product-card {
  background: var(--color-surface);
  border-color: var(--color-border-primary);
}

.dark-mode .product-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-dark);
}

.dark-mode .product-image {
  background: var(--color-surface-variant);
}

.dark-mode .product-image-placeholder {
  background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
}

.dark-mode .product-info h4 {
  color: var(--color-text-primary);
}

.dark-mode .sku {
  color: var(--color-text-tertiary);
}

.dark-mode .price {
  color: var(--color-success);
}

.dark-mode .special-price {
  color: var(--color-error);
}

.dark-mode .description {
  color: var(--color-text-secondary);
 background: var(--color-surface-variant);
}

.dark-mode .rating {
  background: var(--color-warning) !important;
  color: var(--color-text-inverse) !important;
}

.dark-mode .quantity-label {
  color: var(--color-text-tertiary);
}

.dark-mode .quantity {
  color: var(--color-text-primary);
}

.dark-mode .quantity.in-stock {
  color: var(--color-success);
}

.dark-mode .quantity.out-of-stock {
  color: var(--color-error);
}

.dark-mode .product-url {
  color: var(--color-primary);
}

.dark-mode .product-url:hover {
  color: var(--color-primary-dark);
}

.dark-mode .modal-footer {
  background: var(--color-surface-variant);
}

.dark-mode .page-info {
  color: var(--color-text-primary);
}

.dark-mode .footer-stats {
  color: var(--color-text-secondary);
}

.dark-mode .modal-header {
  background: var(--color-surface);
  border-bottom-color: var(--color-border-primary);
}

.dark-mode .modal-header h3 {
  color: var(--color-text-primary);
}

.dark-mode .btn-close {
  color: var(--color-text-tertiary);
}

.dark-mode .btn-close:hover {
  color: var(--color-text-primary);
}

.dark-mode .modal-content h3 {
  color: var(--color-text-primary);
}

.dark-mode .modal-content p {
  color: var(--color-text-secondary);
}

.dark-mode .products-table thead {
  background: var(--color-surface-variant);
}

.dark-mode .products-table th {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-border-primary);
}

.dark-mode .products-table td {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-border-secondary);
}

.dark-mode .products-table tbody tr:hover {
  background: var(--color-surface-variant);
}

.dark-mode .empty-products {
  color: var(--color-text-secondary);
}

.dark-mode .empty-state h3 {
  color: var(--color-text-primary);
}

.dark-mode .empty-state p {
  color: var(--color-text-secondary);
}

.dark-mode .more-items {
  color: var(--color-text-secondary);
  border-top-color: var(--color-border-primary);
}

.dark-mode .sync-status {
  background: var(--color-success-light);
  color: var(--color-success);
}

.dark-mode .status-indicator {
  background: var(--color-success);
}

.dark-mode .status-indicator.syncing {
  background: var(--color-warning);
}

.dark-mode .sync-status-page h3 {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-border-primary);
}

.dark-mode .summary-card {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.dark-mode .sync-detail-section h4 {
  color: var(--color-text-primary);
}

.dark-mode .catalog-sync-item {
  background: var(--color-surface-variant);
  border-left-color: var(--color-primary);
}

.dark-mode .sync-info h5 {
  color: var(--color-text-primary);
}

.dark-mode .sync-details-text {
  color: var(--color-text-secondary);
}

.dark-mode .sync-bar {
  background: var(--color-surface-variant);
}

.dark-mode .sync-fill {
  background: linear-gradient(90deg, var(--color-success), var(--color-primary));
}

.dark-mode .sync-percentage {
  color: var(--color-text-primary);
}

.dark-mode .sync-footer {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.dark-mode .sync-catalog {
  color: var(--color-text-primary);
}

.dark-mode .sync-progress {
  background: var(--color-surface-variant);
}

.dark-mode .notification.success {
  background: var(--color-success);
}

.dark-mode .notification.error {
  background: var(--color-error);
}

.dark-mode .notification.info {
  background: var(--color-primary);
}

/* Modal overlay and content missing dark theme */
.dark-mode .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark-mode .modal-content {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.dark-mode .modal-content.large {
  background: var(--color-surface);
}

/* Modal toolbar search input */
.dark-mode .modal-toolbar .form-input {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
}

.dark-mode .modal-toolbar .form-input::placeholder {
  color: var(--color-text-tertiary);
}

.dark-mode .modal-toolbar .form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

/* Product filters */
.dark-mode .product-filters select {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
}

.dark-mode .product-filters select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

/* Product cards in modal */
.dark-mode .product-card {
  background: var(--color-surface);
  border-color: var(--color-border-primary);
}

.dark-mode .product-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-dark);
}

.dark-mode .product-image {
  background: var(--color-surface-variant);
}

.dark-mode .product-image-placeholder {
  background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
}

.dark-mode .product-info h4 {
  color: var(--color-text-primary);
}

.dark-mode .sku {
  color: var(--color-text-tertiary);
}

.dark-mode .price {
  color: var(--color-success);
}

.dark-mode .special-price {
  color: var(--color-error);
}

.dark-mode .description {
  color: var(--color-text-secondary);
  background: var(--color-surface-variant);
}

.dark-mode .rating {
  background: var(--color-warning) !important;
  color: var(--color-text-inverse) !important;
}

.dark-mode .quantity-label {
  color: var(--color-text-tertiary);
}

.dark-mode .quantity {
  color: var(--color-text-primary);
}

.dark-mode .quantity.in-stock {
  color: var(--color-success);
}

.dark-mode .quantity.out-of-stock {
  color: var(--color-error);
}

.dark-mode .product-url {
  color: var(--color-primary);
}

.dark-mode .product-url:hover {
  color: var(--color-primary-dark);
}

/* Pagination in modal */
.dark-mode .pagination-info {
  color: var(--color-text-primary);
}

.dark-mode .pagination-controls .btn {
  background: var(--color-surface-variant);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
}

.dark-mode .pagination-controls .btn:hover:not(:disabled) {
  background: var(--color-bg-hover);
}

.dark-mode .pagination-controls .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty states */
.dark-mode .empty-products {
  color: var(--color-text-secondary);
  background: var(--color-surface-variant);
}

.dark-mode .empty-state {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.dark-mode .empty-state h3 {
  color: var(--color-text-primary);
}

.dark-mode .empty-state p {
  color: var(--color-text-secondary);
}

.dark-mode .more-items {
  color: var(--color-text-secondary);
  border-top-color: var(--color-border-primary);
}

/* Sync status */
.dark-mode .sync-status {
  background: var(--color-success-light);
  color: var(--color-success);
}

.dark-mode .status-indicator {
  background: var(--color-success);
}

.dark-mode .status-indicator.syncing {
  background: var(--color-warning);
}

/* Sync status page */
.dark-mode .sync-status-page {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.dark-mode .sync-status-page h3 {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-border-primary);
}

/* Summary cards */
.dark-mode .summary-card {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: var(--color-text-primary);
}

/* Sync detail sections */
.dark-mode .sync-detail-section h4 {
  color: var(--color-text-primary);
}

.dark-mode .catalog-sync-item {
  background: var(--color-surface-variant);
  border-left-color: var(--color-primary);
}

.dark-mode .sync-info h5 {
  color: var(--color-text-primary);
}

.dark-mode .sync-details-text {
  color: var(--color-text-secondary);
}

.dark-mode .sync-bar {
  background: var(--color-surface-variant);
}

.dark-mode .sync-fill {
  background: linear-gradient(90deg, var(--color-success), var(--color-primary));
}

.dark-mode .sync-percentage {
  color: var(--color-text-primary);
}

.dark-mode .sync-footer {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.dark-mode .sync-catalog {
  color: var(--color-text-primary);
}

.dark-mode .sync-progress {
  background: var(--color-surface-variant);
}

/* Notifications */
.dark-mode .notification.success {
  background: var(--color-success);
  color: var(--color-text-inverse);
}

.dark-mode .notification.error {
  background: var(--color-error);
  color: var(--color-text-inverse);
}

.dark-mode .notification.info {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}
</style>
