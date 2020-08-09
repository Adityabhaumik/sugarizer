var PollSettings = {
	/*html*/
	template: `
		<div class="settings poll-settings">
			<poll-card 
				:poll="poll"
			></poll-card>
			<form @submit.prevent="onConfirm">
				<div>
					<label for="type">{{ l10n.stringType }}</label>
					<select v-model="poll.typeVariable">
						<option :value="type" v-for="(image, type) in types" :key="type">{{ $root.$refs.SugarL10n.get(type) }}</option>
					</select>
				</div>
				<div>
					<div class="image-label">
						<label for="image">{{ l10n.stringImage }}</label>
						<button type="button" id="image-edit-button" @click="onUploadClick"></button>
					</div>
					<img :src="poll.image">
				</div>
				<div>
					<label for="question">{{ l10n.stringQuestion }}</label>
					<input type="text" name="question" v-model="poll.question" required>
				</div>
				<div v-if="poll.typeVariable == 'MCQ' || poll.typeVariable == 'ImageMCQ'">
					<div class="options-label">
						<label for="options">{{ l10n.stringOptions }}</label>
						<button type="button" class="add-option-button" @click="addOption"></button>
					</div>
					<draggable :class="{ 'image-mcq': poll.typeVariable == 'ImageMCQ' }" v-model="poll.options" animation="300">
						<div class="option" v-for="(option, i) in poll.options" :key="i">
							<input 
								v-if="poll.typeVariable == 'MCQ'"
								type="text" 
								name="option" 
								v-model="poll.options[i]" 
								required
							>
							<div class="option-image">
								<img v-if="poll.typeVariable == 'ImageMCQ'" :src="option">
								<button type="button" class="delete-option-button" :class="{ 'image-mcq': poll.typeVariable == 'ImageMCQ' }" @click="deleteOption(i)"></button>
							</div>
						</div>
					</draggable>
				</div>
				
				<div class="buttons-row">
					<button type="submit" :disabled="poll.question == ''">
						<img src="icons/dialog-ok.svg">
						<span>{{ l10n.stringConfirm }}</span>
					</button>
					<button type="button" @click="$emit('go-back-to', 'polls-grid')">
						<img src="icons/dialog-cancel.svg">
						<span>{{ l10n.stringCancel }}</span>
					</button>
				</div>
			</form>
		</div>
	`,
	components: {
		'poll-card': PollCard
	},
	props: ['polls', 'activePoll', 'activePollStatus'],
	watch: {
		"poll.typeVariable": function(newVal, oldVal) {
			this.poll.type = this.$root.$refs.SugarL10n.get(newVal);
			this.poll.image = this.types[newVal];
		},
	},
	data: () =>  ({
		poll: {
			type: '',
			typeVariable: 'YesNo',
			image: 'images/yesno.png',
			question: '',
			options: [],
			results: null
		},
		types: {
			"YesNo": "images/yesno.png",
			"Rating": "images/rating.png",
			"MCQ": "images/mcq.png",
			"Text": "images/text.png",
			"ImageMCQ": "images/image-mcq.png"
		},
		l10n: {
			stringQuestion: '',
			stringType: '',
			stringImage: '',
			stringOptions: '',
			stringConfirm: '',
			stringCancel: ''
		}
	}),
	created: function() {
		var vm = this;
		if(this.activePoll && this.activePollStatus == "editing") {			// Edit poll
			this.poll = JSON.parse(JSON.stringify(this.activePoll));
		} else {													// Add poll
			// Do nothing
		}
	},
	mounted: function() {
		this.$root.$refs.SugarL10n.localize(this.l10n);
	},
	methods: {
		onUploadClick: function(target) {
			let vm = this;
			var filters = [
				{ mimetype: 'image/png' },
				{ mimetype: 'image/jpeg' }
			];
			this.$root.$refs.SugarJournal.insertFromJournal(filters)
				.then((data, metadata) => {
					vm.poll.image = data;
				});
		},

		addOption() {
			if(this.poll.typeVariable == "MCQ") {
				this.poll.options.push("");
			} else if(this.poll.typeVariable == "ImageMCQ") {
				let vm = this;
				var filters = [
					{ mimetype: 'image/png' },
					{ mimetype: 'image/jpeg' }
				];
				this.$root.$refs.SugarJournal.insertFromJournal(filters)
					.then((data, metadata) => {
						vm.poll.options.push(data);
					});
			}
		},

		deleteOption(i) {
			this.$delete(this.poll.options, i);
		},

		onConfirm: function() {
			if(this.activePoll && this.activePollStatus == "editing") {			// Edit poll
				var vm = this;
				var index = this.polls.findIndex(function (poll) {
					return poll.id === vm.activePoll.id;
				});

				if(this.poll.typeVariable != "MCQ" && this.poll.typeVariable != "ImageMCQ") {
					this.$delete(this.poll, 'options');
				}
				this.polls[index] = this.poll;
			} else {													// Add poll
				this.addPoll();
			}
			this.$emit('go-back-to', 'polls-grid');
		},

		addPoll: function() {
			var nextId = this.polls.length;
			this.poll.id = nextId;
			this.polls.push(this.poll);
			// setTimeout(function () {
			// 	content.scrollTop = content.scrollHeight;
			// }, 250);
		}
	}
}