/* @ngInject */
function blackFridayModal($state, authentication, CONSTANTS, dispatchers, pmModal, blackFridayModel, subscriptionModel) {
    const { TWO_YEARS } = CONSTANTS.CYCLE;
    return pmModal({
        controllerAs: 'ctrl',
        templateUrl: require('../../../templates/blackFriday/blackFridayModal.tpl.html'),
        /* @ngInject */
        controller: function(params, $scope, userType) {
            const { dispatcher, on, unsubscribe } = dispatchers(['blackFriday', 'closeDropdown']);

            on('blackFriday', (event, { type = '' }) => {
                if (type === 'loaded') {
                    $scope.$applyAsync(() => {
                        this.loaded = true;
                    });
                }
            });

            this.loaded = false;
            this.isFreeUser = userType().isFree;
            this.isPaidUser = authentication.user.Subscribed;
            this.close = () => {
                blackFridayModel.saveClose();
                params.close();
            };

            this.dashboard = () => {
                if (!$state.is('secured.dashboard')) {
                    $state.go('secured.dashboard', {
                        noBlackFridayModal: true,
                        currency: this.currency,
                        cycle: TWO_YEARS
                    });
                }

                this.close();
            };

            this.buy = (plan = 'current') => {
                dispatcher.blackFriday('buy', { plan });
                this.close();
            };

            this.changeCurrency = (currency = 'EUR') => {
                this.currency = currency;
                blackFridayModel.set('currency', currency);
                dispatcher.closeDropdown();
            };

            this.$onDestroy = () => {
                unsubscribe();
            };

            this.currency = subscriptionModel.currency();
            this.changeCurrency(this.currency);
            // Load requirements for the payment modal
            dispatcher.blackFriday('load');
        }
    });
}
export default blackFridayModal;
