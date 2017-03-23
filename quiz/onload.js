var answers = []
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
   console.log(JSON.parse(atob(string)))
}

window.onload = function() {
      try {
         var q = decodeQuiz(window.location.hash.substr(1))
         putQuestion(q, 0)
      } catch (e) {
         alert("invalid")
      }
   }
   //Quiz.prototype

function putQuestion(quiz, index) {
   document.forms.$quiz.$question.value = quiz[index].question
   for (var i = 0; i < 4; i++) {
      document.forms.$quiz.$answer[i].nextSibling.textContent = quiz[index].answer[i]
      document.forms.$quiz.$answer[i].checked = false
      document.forms.$quiz.$answer[i].onchange = function() {
         var choice = this.value
         answers.push(choice == quiz[index].correct)
         if (++index < quiz.length) {
            putQuestion(quiz, index)
         } else {
            document.forms.$quiz.$score.value = answers.reduce(function(sum, a) {
               return sum + a
            }, 0) / index * 100 + "%";
         }
      }
   }
}
