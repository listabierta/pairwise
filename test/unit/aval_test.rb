require 'test_helper'

class AvalTest < ActiveSupport::TestCase
  should "be valid with factory" do
    assert_valid Factory.build(:aval)
  end
end
