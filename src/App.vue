<template>
  <main>
    <RouterView />
  </main>
</template>

<style>
  v-container {
    max-width:none !important;
  }
  .vuecal__cell:hover, .day-split-header {
    cursor:pointer;
  }
  .day-split-header:hover {
    text-decoration:underline;
  }
  /* Style events */
  .vuecal__event-title {
    font-size: 1rem;
    font-weight: 100;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }
  .event {
    background-color: rgb(210, 210, 210);
    padding: 0.5rem;
    color: rgb(57, 57, 57);
    border-left: 4px solid rgb(100, 100, 100);
    border-radius: 5px;
    width: 90% !important;
    left: 10% !important;
  }
  .vuecal__event-time {
    display: none;
  }
  .vuecal__no-event {
    display: none;
  }
  /*Style dialog window */
  .v-card-title {
    font-weight: bold;
    padding-bottom: 0 !important;
    padding-top: 1rem;
    text-align: center;
    padding-top: 1rem;
    font-size: 1.7rem !important;
  }
  .close-btn {
    position: absolute; 
    right: 1rem; 
    top: 1rem;
  }
  .close-btn:hover {
    cursor: pointer;
  }
  /*Style Table*/
  table {
    justify-content: center;
    width: 100%;
    border: 1px solid rgb(63, 63, 63) !important;
    border-collapse:collapse !important; 
  }
  th, td {
    border: 1px solid rgb(63, 63, 63) !important;
    padding: 8px !important;
    text-align: center;
  }
  .t-header {
    font-weight: bold;
  }
  /* Style heating events */
  .heating {
    background-color:  rgb(230, 100, 100);
    color: rgb(57, 57, 57);
    border-radius: 4px;
    width: 10% !important;
    cursor:default !important;
  }
  /*Style now line */
  .vuecal__now-line {
    color: rgb(63, 63, 63);
    border-top: 1.5px solid rgb(63, 63, 63);
  }
  /*Style split columns*/
  .vuecal .day-split-header {
    font-size: 1rem;
  }
  /*Style calendar columns */
  .vuecal__cell-split {
    border: 0.5px solid rgb(222, 222, 222) !important;
  }
</style>