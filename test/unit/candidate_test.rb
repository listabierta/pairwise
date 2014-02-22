require 'test_helper'

class CandidateTest < ActiveSupport::TestCase
  should "be valid with factory" do
    assert_valid Factory.build(:candidate)
  end
end
