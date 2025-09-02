<template>
  <canvas ref="canvas" class="animated-bg"></canvas>
</template>

<script>
export default {
  name: 'AnimatedBackground',
  mounted() {
    this.initAnimation();
    window.addEventListener('resize', this.resizeCanvas);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCanvas);
    cancelAnimationFrame(this.frameId);
  },
  methods: {
    resizeCanvas() {
      const canvas = this.$refs.canvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    },
    initAnimation() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      this.resizeCanvas();
      const NODES = 100;
      const nodes = Array.from({ length: NODES }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7
      }));
      const connectDist = 200;
      const repulsionDist = 50;
      const repulsionFactor = 0.001; 

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Move nodes and apply repulsion
        nodes.forEach((node, index) => {
          node.x += node.vx;
          node.y += node.vy;

          // Check for boundaries
          if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
          if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

          // Apply repulsion from other nodes
          nodes.forEach((otherNode, otherIndex) => {
            if (index !== otherIndex) {
              const dx = node.x - otherNode.x;
              const dy = node.y - otherNode.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < repulsionDist) {
                const force = repulsionFactor * (repulsionDist - dist);
                node.vx += (dx / dist) * force;
                node.vy += (dy / dist) * force;
              }
            }
          });
        });

        // Draw connections
        for (let i = 0; i < NODES; i++) {
          for (let j = i + 1; j < NODES; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectDist) {
              ctx.strokeStyle = `rgba(0,120,212,${1 - dist / connectDist})`;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw nodes
        nodes.forEach(node => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#0078d4';
          ctx.shadowColor = '#0078d4';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
        this.frameId = requestAnimationFrame(animate);
      };
      animate();
    }

  }
};
</script>

<style scoped>
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  background: transparent;
}
</style>
