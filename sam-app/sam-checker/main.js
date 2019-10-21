Vue.use(VueMaterial.default);
Vue.use(window.VueCodemirror);

Vue.component("doctest-activity", {
  props: ["layoutThings", "questionName"],
  data: function() {
    return {
      answer: {
        jsonFeedback: "",
        htmlFeedback: "",
        textFeedback: "",
        isComplete: false
      },
      layoutItems: this.layoutThings,
      cmOptions: {
        mode: "yaml",
        lineNumbers: true
      },
      cmReadOnly: {
        lineNumbers: true,
        mode: "python",
        readOnly: true
      }
    };
  },
  methods: {
    postContents: function() {
      // comment: leaving the gatewayUrl empty - API will post back to itself
      const gatewayUrl = "";
      this.$set(this, "answer", {
        jsonFeedback: "",
        htmlFeedback: "",
        textFeedback: "",
        isComplete: false
      });
      fetch(gatewayUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          shown: { 0: this.layoutItems[0].vModel },
          editable: { 0: this.layoutItems[1].vModel }
        })
      })
        .then(response => {
          return response.json();
        })
        .then(data => {
          this.answer = JSON.parse(JSON.stringify(data));
          this.answer.jsonFeedback = JSON.stringify(this.answer.jsonFeedback);
          return this.$emit("questionhandler", {
            data,
            questionName: this.questionName
          });
        });
    }
  },
  template: `<div class="md-layout  md-gutter">
                <div id="cardGroupPreview" class="md-layout-item">
                    <md-card>
                        <md-card-header>
                            <md-card-header-text>
                                <div class="md-title">Instructions</div>
                            </md-card-header-text>
                        </md-card-header>
                        <md-card-content>
                            <md-field>
                                <md-tabs>
                                    <md-tab :md-label="layoutItems[2].header">
                                <div class="md-subhead">{{layoutItems[2].subHeader}}</div>
                                <md-textarea v-model="layoutItems[2].vModel" readonly></md-textarea>
                    </md-tab>            
                <md-tab  :md-label="layoutItems[0].header">
                                <div class="md-subhead">{{layoutItems[0].subHeader}}</div>
                                <codemirror class="testsTextarea" v-model="layoutItems[0].vModel" :options="cmOptions"></codemirror>
                    </md-tab>
                    <md-tab v-for="item in layoutItems.slice([3,])" :md-label="item.header">
                                <div class="md-subhead">{{item.subHeader}}</div>
                                <codemirror class="appTextarea" v-model="item.vModel" :options="{lineNumbers: true,mode:item.mode,readOnly: false}"></codemirror>
                    </md-tab>
                    </md-tabs>
                            </md-field>
                        </md-card-content>
                    </md-card>
                    
                    <md-card>
                        <md-card-header>
                            <md-card-header-text>
                                <div class="md-title">Output</div>
                                <div class="md-subhead">Test results</div>
                            </md-card-header-text>
                        </md-card-header>
                        <md-card-content>
                            <md-field>
                                <md-tabs>
                                    <md-tab id="tab-htmlResults" md-label="HTML results">
                                        <div v-html="answer.htmlFeedback"></div>
                                    </md-tab>
                                    <md-tab id="tab-jsonResults" md-label="JSON results">
                                        <md-textarea v-model="answer.jsonFeedback" readonly></md-textarea>
                                    </md-tab>
                                    <md-tab id="tab-textResults" md-label="Text results">
                                        <md-textarea v-model="answer.textFeedback" readonly></md-textarea>
                                    </md-tab>
                                </md-tabs>
                            </md-field>
                        </md-card-content>
                    </md-card>
                </div>
                <div id="cardGroupCreator" class="md-layout-item">
                    <md-card>
                        <md-card-header>
                            <md-card-header-text>
                                <div class="md-title">{{layoutItems[1].header}}</div>
                                <div class="md-subhead">{{layoutItems[1].subHeader}}</div>
                            </md-card-header-text>
                                <md-card-media>
                                    <md-button class="md-raised md-primary" v-on:click="postContents">Submit</md-button>
                                </md-card-media>
                        </md-card-header>
                        <md-card-content>
                            <md-field>
                                <codemirror class="editableTextarea" v-model="layoutItems[1].vModel" :options="cmOptions"></codemirror>
                            </md-field>
                        </md-card-content>
                    </md-card>
                </div>            
            </div>
            `
});

new Vue({
  el: "#app",
  data: function() {
    return {
      questions: [
        {
          name: "question 1",
          layoutItems: [
            {
              header: "Tests",
              subHeader: "",
              vModel:
                "GET, text=madam, response.type, shouldEqual, text/text\nGET, text=banana, response.body, shouldContain, banana"
            },
            {
              header: "Editable Code Block",
              subHeader: "Your code goes below. Avoid double quotes.",
              vModel:
                'AWSTemplateFormatVersion: "2010-09-09"\nTransform: AWS::Serverless-2016-10-31\n\nResources:\n  LambdaFunc:\n    Type: AWS::Serverless::Function\n    Properties:\n      CodeUri: hello_world/\n      Handler: "app.lambda_handler"\n      Runtime: "python2.7"\n      Events: \n        ExecuteFunc:\n          Type: Api\n          Properties:\n            Path: /\n            Method: any\n  FunctionRole:\n    Properties: \n      AssumeRolePolicyDocument:\n        Statement:\n        - Action:\n          - sts: AssumeRole\n          Effect: Allow\n          Principal:\n          Service:\n            - lambda.amazonaws.com\n      ManagedPolicyArns:\n      - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole\n      - arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess\n      Path: /\n      Type: AWS::IAM::Role'
            },
            {
              header: "Introduction",
              subHeader: "",
              vModel: "Map a route from API path x to function handler A"
            },
            {
              header: "app.py",
              mode: "python",
              subHeader: "",
              vModel:
                'import json\nimport requests\ndef lambda_handler(event, context):\n\treturn {\n\t\t"statusCode": 200,\n\t\t"body": json.dumps(\n\t\t\t{"message": "hello world"}\n\t\t),\n\t}'
            }
          ],
          status: " 🔴"
        }
      ]
    };
  },
  methods: {
    toggleQuestionStatus(response) {
      const { data, questionName } = response;
      if (data.htmlFeedback) {
        const searchText = data.htmlFeedback;
        searchText.search(/b2d8b2/) !== -1
          ? searchText.search(/#ff9999/) == -1
            ? (this.questions.find(item => item.name === questionName).status =
                " ✔️")
            : (this.questions.find(item => item.name === questionName).status =
                " 🤨")
          : (this.questions.find(item => item.name === questionName).status =
              " 🔴");
      }
    }
  }
});
