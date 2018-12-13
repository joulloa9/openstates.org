import pytest
from graphapi.tests.utils import populate_db
from opencivicdata.core.models import Organization, Person, Membership


@pytest.mark.django_db
def setup():
    populate_db()
    house = Organization.objects.get(classification="lower", jurisdiction__name="Alaska")
    r = Organization.objects.create(name="Robots", classification="committee", parent=house,
                                    jurisdiction=house.jurisdiction)
    w = Organization.objects.create(name="Wizards", classification="committee", parent=house,
                                    jurisdiction=house.jurisdiction)
    # one robot
    p = Person.objects.get(name="Amanda Adams")
    Membership.objects.create(person=p, organization=r)
    # all are wizards
    for p in Person.objects.all()[:5]:
        Membership.objects.create(person=p, organization=w)


@pytest.mark.django_db
def test_committees_view(client, django_assert_num_queries):
    with django_assert_num_queries(2):
        resp = client.get("/public/ak/committees")
    assert resp.status_code == 200
    assert resp.context["state"] == "ak"
    assert resp.context["state_nav"] == "committees"
    assert len(resp.context["chambers"]) == 2
    assert len(resp.context["committees"]) == 2

    # check member_counts
    one, two = resp.context["committees"]
    if one["name"] == "Robots":
        robots, wizards = one, two
    else:
        robots, wizards = two, one
    assert robots["member_count"] == 1
    assert wizards["member_count"] == 5


