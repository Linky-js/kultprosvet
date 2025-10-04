<script>
export default {
    name: "TabsBlock ",
    props: {
        tabsArray: {
            type: Array,
            required: true
        },
        curTab: {
            type: String,
            required: true
        }
        
    },
    data() {
        return {
            currentTab: '',
        }
    },
    methods: {
        changeTab(tab) {
            this.currentTab = tab;
            this.$emit('changeTab', tab);
        }
    },
    mounted() {
       this.changeTab(this.curTab);
       
    }
}
</script>

<template>
    <div class="tabs">
        <ul class="tabs__list">
            <li
                v-for="tab in tabsArray"
                :key="tab"
                class="tabs__item"
                :class="{ 'tabs__item--active': currentTab === tab }"
                @click="changeTab(tab)"
            >
                {{ tab }}
            </li>
        </ul>
        
    </div>
</template>

<style scoped>
 .tabs__list{
     display: flex;
     gap: 10px;
     margin-bottom: 20px;
 }
 .tabs__item{
     cursor: pointer;
     padding: 10px 20px;
     border-radius: 5px;
     transition: all 0.3s;
 }
 .tabs__item:hover{
     background: var(--Black-200, #f2f2f2);
 }
 .tabs__item--active{
     background: var(--Black-200, #f2f2f2);
     color: var(--Black-1200, #2e2e2e);
 }   
</style>