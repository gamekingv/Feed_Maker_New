<script>
export default {
    computed: {
        icons() {
            let styles = '',
                feeds = this.$store.state.groups.reduce((feeds, group) => feeds.concat(group.feeds), []);
            for (let { id, icon } of feeds) {
                if (icon !== '')
                    styles += `.custom-feed-icon-${id}{background-image:url('${icon}');}`;
            }
            return styles;
        }
    },
    render(createElement) {
        return createElement('style', this.icons);
    }
};
</script>

<style lang="scss">
[class^="custom-feed-icon"] {
    background-repeat: no-repeat;
    background-size: 22px;
    background-position: center center;
}
</style>
