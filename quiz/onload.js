var answers = []
var quiz
/*console.log(encodeQuiz( [{
   question: "what's 1+1",
   answer: [
      "2",
      "false",
      "11",
      "all of the above"
   ],
   correct: 3
}, {
   question: "does this work?",
   answer: [
      "yes",
      "no",
      "yes",
      "yes"
   ],
   correct: 2
}]))

//class Quiz {
//	function 

//}

function encodeQuiz(quiz) {
   return btoa(JSON.stringify(quiz))
}*/

function decodeQuiz(string) {
   quiz = JSON.parse(atob(string))
}

window.onload = function() {
         decodeQuiz(window.location.hash.substr(1))
         putQuestion(0)
   }
   //Quiz.prototype

function putQuestion(index) {
   document.forms.$quiz.$question.value = quiz[index].question
   for (var i = 0; i < 4; i++) {
      document.forms.$quiz.$answer[i].nextSibling.textContent = quiz[index].answer[i]
      document.forms.$quiz.$answer[i].checked = false
      document.forms.$quiz.$answer[i].onchange = function() {
         var choice = this.value
         answers.push(choice == quiz[index].correct)
         if (++index < quiz.length) {
            putQuestion(index)
         } else {
            document.forms.$quiz.$score.value = answers.reduce(function(sum, a) {
               return sum + a
            }, 0) / index * 100 + "%";
         }
      }
   }
}
