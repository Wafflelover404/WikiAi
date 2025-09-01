<template>
  <div>
    <table v-if="reports.length" class="users-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Date</th>
          <th>Files</th>
          <th>Issue</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in reports" :key="r.date + r.user + r.issue">
          <td>{{ r.user }}</td>
          <td>{{ formatDate(r.date) }}</td>
          <td>
            <span v-for="f in r.permitted_files" :key="f">{{ f }}<br/></span>
          </td>
          <td>{{ r.issue }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty-msg">{{ emptyMsg }}</div>
  </div>
</template>

<script>
export default {
  name: 'ReportTable',
  props: {
    reports: { type: Array, required: true },
    emptyMsg: { type: String, default: 'No reports found.' }
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      // Try to format ISO date string
      try {
        const d = new Date(date);
        return d.toLocaleString();
      } catch {
        return date;
      }
    }
  }
};
</script>

<style scoped>
.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}
.users-table th, .users-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
}
.users-table th {
  background: #e3f2fd;
}
.empty-msg {
  margin-top: 16px;
  color: #888;
}
</style>
