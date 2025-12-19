<template>
  <div class="product-card">
    <div class="product-image">
      <img :src="product.metadata.image" :alt="product.metadata.name" @error="handleImageError" />
    </div>
    <div class="product-details">
      <h3 class="product-title">
        <a :href="product.metadata.url" target="_blank" rel="noopener noreferrer">
          {{ product.metadata.name }}
        </a>
      </h3>
      
      <div class="product-price">
        <span class="current-price">{{ formatPrice(product.metadata.price) }} BYN</span>
        <span v-if="product.metadata.special_price" class="original-price">
          {{ formatPrice(product.metadata.special_price) }} BYN
        </span>
      </div>
      
      <div class="product-stock" :class="{ 'in-stock': product.metadata.quantity > 0, 'out-of-stock': product.metadata.quantity <= 0 }">
        {{ product.metadata.quantity > 0 ? 'В наличии' : 'Нет в наличии' }}
      </div>
      
      <div class="product-description" v-html="formatDescription(product.metadata.description)"></div>
      
      <div class="product-actions">
        <a :href="product.metadata.url" target="_blank" class="view-button">
          Перейти в магазин
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatPrice(price) {
      if (!price) return '0.00';
      return parseFloat(price).toFixed(2);
    },
    formatDescription(desc) {
      if (!desc) return '';
      // Convert newlines to <br> and format the description
      return desc
        .replace(/\r\n|\r|\n/g, '<br>')
        .replace(/<br><br>+/g, '<br>');
    },
    handleImageError(e) {
      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
    }
  }
}
</script>

<style scoped>
.product-card {
  display: flex;
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  background: var(--color-surface);
  box-shadow: var(--color-shadow-light);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--color-shadow-medium);
}

.product-image {
  width: 300px;
  min-width: 300px;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.product-image img {
  max-width: 100%;
  max-height: 250px;
  object-fit: contain;
}

.product-details {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.product-title {
  margin: 0 0 10px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.product-title a {
  color: var(--color-text-primary);
  text-decoration: none;
}

.product-title a:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

.product-price {
  margin-bottom: 10px;
}

.current-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-right: 10px;
}

.original-price {
  text-decoration: line-through;
  color: var(--color-text-secondary);
  font-size: 1.1rem;
}

.product-stock {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 15px;
}

.in-stock {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.out-of-stock {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.product-description {
  flex: 1;
  color: var(--color-text-primary);
  line-height: 1.5;
  margin-bottom: 15px;
  max-height: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.product-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.view-button {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.view-button:hover {
  background-color: var(--color-primary-dark);
}

/* Responsive styles */
@media (max-width: 768px) {
  .product-card {
    flex-direction: column;
  }
  
  .product-image {
    width: 100%;
    height: 200px;
  }
  
  .product-image img {
    max-height: 180px;
  }
  
  .product-description {
    -webkit-line-clamp: 4;
    line-clamp: 4;
  }
}
</style>
